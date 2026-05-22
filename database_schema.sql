-- Celestial Ring Database Schema
-- PostgreSQL relational schema optimized for an Eastern Medicine knowledge app.
-- Design goals:
-- 1. Keep herb core data compact and query-friendly.
-- 2. Move long editorial text into detail/source tables.
-- 3. Model formulas, herb pairing, symptom search, OCR sources, and review workflow.
-- 4. Preserve safety/legal traceability for health-related content.

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE publication_status AS ENUM ('draft', 'needs_review', 'reviewed', 'published', 'archived');
CREATE TYPE safety_level AS ENUM ('none', 'low', 'medium', 'high', 'toxic', 'forbidden');
CREATE TYPE demand_level AS ENUM ('popular', 'common', 'specialist', 'rare');
CREATE TYPE source_kind AS ENUM ('book', 'pdf', 'ocr_text', 'website', 'expert_review', 'other');
CREATE TYPE extraction_status AS ENUM ('not_started', 'scan_needs_ocr', 'ocr_done', 'cleaned', 'verified');
CREATE TYPE combination_type AS ENUM ('tuong_tu', 'tuong_su', 'tuong_uy', 'tuong_sat', 'tuong_op', 'tuong_phan', 'unknown');
CREATE TYPE formula_role AS ENUM ('quan', 'than', 'ta', 'su', 'other');
CREATE TYPE target_entity_type AS ENUM ('herb', 'formula', 'combination', 'symptom', 'source');

-- Updated-at helper.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- GROUP 1: CORE HERB PROFILES
-- =========================================================

CREATE TABLE herbs (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(180) UNIQUE NOT NULL,

    -- Names
    name_vn VARCHAR(255) NOT NULL,
    name_hanviet VARCHAR(255),
    name_han VARCHAR(255),
    name_scientific VARCHAR(255),
    family VARCHAR(255),

    -- Classification and filtering
    group_category VARCHAR(180),          -- e.g. Thuoc bo khi, Thanh nhiet giai doc
    nature VARCHAR(100),                  -- Han, Nhiet, On, Luong, Binh...
    flavor VARCHAR(160),                  -- Chua, Ngot, Dang/Kho, Cay, Man...
    meridian_tropism TEXT,                -- Can, Tam, Ty, Phe, Than...
    part_used VARCHAR(180),               -- Re, Than, La, Qua, Vo...

    -- Safety and sorting
    caution TEXT,
    toxicity_level safety_level DEFAULT 'none',
    is_toxic BOOLEAN GENERATED ALWAYS AS (toxicity_level IN ('high', 'toxic', 'forbidden')) STORED,
    demand demand_level DEFAULT 'common',

    image_url TEXT,
    status publication_status DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER herbs_set_updated_at
BEFORE UPDATE ON herbs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE herb_details (
    herb_id BIGINT PRIMARY KEY REFERENCES herbs(id) ON DELETE CASCADE,
    description TEXT,                     -- Botanical/morphology description (Mô tả thực vật)
    theoretical_basis TEXT,               -- Cơ sở lý luận (Theoretical basis for the herb's use)
    tcm_effects TEXT,                     -- Tác dụng thuốc theo đông y (Effects according to TCM)
    tcm_preparation TEXT,                 -- Bào chế thuốc theo đông y (Preparation according to TCM)
    modern_effects TEXT,                  -- Tác dụng của thuốc theo khoa học hiện đại (Pharmacological effects)
    dosage TEXT,                          -- Lieu dung (Dosage)
    basic_summary TEXT,                   -- User-friendly summary
    detailed_usage TEXT,                  -- Advanced editorial content
    modern_safety_note TEXT,              -- Known modern cautions/interactions
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER herb_details_set_updated_at
BEFORE UPDATE ON herb_details
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE herb_aliases (
    id BIGSERIAL PRIMARY KEY,
    herb_id BIGINT REFERENCES herbs(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    language VARCHAR(40) DEFAULT 'vi',
    alias_type VARCHAR(80),               -- folk, hanviet, latin, ocr_variant, synonym
    UNIQUE (herb_id, alias, language)
);

CREATE TABLE herb_tags (
    herb_id BIGINT REFERENCES herbs(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (herb_id, tag)
);

CREATE TABLE use_cases (
    id VARCHAR(80) PRIMARY KEY,
    label VARCHAR(180) NOT NULL,
    short_label VARCHAR(100),
    description TEXT
);

CREATE TABLE herb_use_cases (
    herb_id BIGINT REFERENCES herbs(id) ON DELETE CASCADE,
    use_case_id VARCHAR(80) REFERENCES use_cases(id) ON DELETE CASCADE,
    PRIMARY KEY (herb_id, use_case_id)
);

-- =========================================================
-- GROUP 2: SOURCES, OCR, AND CITATIONS
-- =========================================================

CREATE TABLE sources (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(180) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    publisher VARCHAR(255),
    publication_year INTEGER,
    kind source_kind DEFAULT 'book',
    local_file TEXT,
    external_url TEXT,
    total_pages INTEGER,
    extraction_status extraction_status DEFAULT 'not_started',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER sources_set_updated_at
BEFORE UPDATE ON sources
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE source_pages (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT REFERENCES sources(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,         -- PDF page number
    printed_page_label VARCHAR(40),       -- Printed page if different
    image_path TEXT,
    ocr_text TEXT,
    cleaned_text TEXT,
    extraction_status extraction_status DEFAULT 'not_started',
    UNIQUE (source_id, page_number)
);

CREATE TABLE citations (
    id BIGSERIAL PRIMARY KEY,
    entity_type target_entity_type NOT NULL,
    entity_id BIGINT NOT NULL,
    source_id BIGINT REFERENCES sources(id) ON DELETE SET NULL,
    source_page_id BIGINT REFERENCES source_pages(id) ON DELETE SET NULL,
    page_start INTEGER,
    page_end INTEGER,
    citation_label VARCHAR(500),
    quote_excerpt TEXT,                   -- Keep short for copyright-safe citation
    editorial_note TEXT,
    confidence SMALLINT CHECK (confidence BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- GROUP 3: HERB PAIRING AND INTERACTIONS
-- =========================================================

CREATE TABLE herb_combinations (
    id BIGSERIAL PRIMARY KEY,
    herb_a_id BIGINT REFERENCES herbs(id) ON DELETE CASCADE,
    herb_b_id BIGINT REFERENCES herbs(id) ON DELETE CASCADE,
    combination_type combination_type NOT NULL DEFAULT 'unknown',
    effect TEXT,                          -- Effect when paired
    is_dangerous BOOLEAN DEFAULT FALSE,
    warning_text TEXT,
    severity safety_level DEFAULT 'none',
    source_rule VARCHAR(180),             -- Thap bat phan, Thap cuu uy...
    status publication_status DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (herb_a_id <> herb_b_id),
    CHECK (herb_a_id < herb_b_id),
    UNIQUE (herb_a_id, herb_b_id, combination_type)
);

CREATE TRIGGER herb_combinations_set_updated_at
BEFORE UPDATE ON herb_combinations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- GROUP 4: CLASSICAL FORMULAS / PRESCRIPTIONS
-- =========================================================

CREATE TABLE formulas (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(180) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_han VARCHAR(255),
    source VARCHAR(255),
    category VARCHAR(180),
    indication TEXT,
    preparation_method TEXT,
    description TEXT,
    caution TEXT,
    status publication_status DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER formulas_set_updated_at
BEFORE UPDATE ON formulas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE formula_aliases (
    id BIGSERIAL PRIMARY KEY,
    formula_id BIGINT REFERENCES formulas(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    language VARCHAR(40) DEFAULT 'vi',
    UNIQUE (formula_id, alias, language)
);

CREATE TABLE formula_ingredients (
    formula_id BIGINT REFERENCES formulas(id) ON DELETE CASCADE,
    herb_id BIGINT REFERENCES herbs(id) ON DELETE RESTRICT,
    dosage_in_formula VARCHAR(100),
    role formula_role DEFAULT 'other',
    preparation_note TEXT,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (formula_id, herb_id)
);

-- Backward-compatible view for current frontend naming.
CREATE VIEW prescriptions AS
SELECT
    id,
    name,
    source,
    category,
    description AS usage,
    indication AS indications,
    preparation_method AS preparation,
    caution,
    created_at,
    updated_at
FROM formulas;

-- =========================================================
-- GROUP 5: SEARCH BY DISEASE / SYMPTOM / USER NEED
-- =========================================================

CREATE TABLE diseases_symptoms (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(180) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(80) DEFAULT 'symptom',    -- disease, symptom, syndrome, user_need
    description TEXT,
    safety_note TEXT,
    status publication_status DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER diseases_symptoms_set_updated_at
BEFORE UPDATE ON diseases_symptoms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE disease_herb_mapping (
    disease_id BIGINT REFERENCES diseases_symptoms(id) ON DELETE CASCADE,
    herb_id BIGINT REFERENCES herbs(id) ON DELETE CASCADE,
    rationale TEXT,
    caution TEXT,
    evidence_level SMALLINT CHECK (evidence_level BETWEEN 1 AND 5),
    PRIMARY KEY (disease_id, herb_id)
);

CREATE TABLE disease_formula_mapping (
    disease_id BIGINT REFERENCES diseases_symptoms(id) ON DELETE CASCADE,
    formula_id BIGINT REFERENCES formulas(id) ON DELETE CASCADE,
    rationale TEXT,
    caution TEXT,
    evidence_level SMALLINT CHECK (evidence_level BETWEEN 1 AND 5),
    PRIMARY KEY (disease_id, formula_id)
);

-- =========================================================
-- GROUP 6: EDITORIAL GOVERNANCE
-- =========================================================

CREATE TABLE editorial_reviews (
    id BIGSERIAL PRIMARY KEY,
    entity_type target_entity_type NOT NULL,
    entity_id BIGINT NOT NULL,
    reviewer_name VARCHAR(180),
    reviewer_role VARCHAR(180),
    status publication_status DEFAULT 'needs_review',
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_type target_entity_type NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(80) NOT NULL,
    actor VARCHAR(180),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_herbs_name_vn ON herbs(name_vn);
CREATE INDEX idx_herbs_name_hanviet ON herbs(name_hanviet);
CREATE INDEX idx_herbs_scientific ON herbs(name_scientific);
CREATE INDEX idx_herbs_group_category ON herbs(group_category);
CREATE INDEX idx_herbs_nature ON herbs(nature);
CREATE INDEX idx_herbs_toxicity ON herbs(toxicity_level);
CREATE INDEX idx_herbs_demand ON herbs(demand);
CREATE INDEX idx_herbs_status ON herbs(status);
CREATE INDEX idx_herb_aliases_alias ON herb_aliases(alias);

CREATE INDEX idx_herb_combinations_pair ON herb_combinations(herb_a_id, herb_b_id);
CREATE INDEX idx_herb_combinations_type ON herb_combinations(combination_type);
CREATE INDEX idx_herb_combinations_danger ON herb_combinations(is_dangerous);

CREATE INDEX idx_formulas_name ON formulas(name);
CREATE INDEX idx_formulas_category ON formulas(category);
CREATE INDEX idx_formula_ingredients_herb ON formula_ingredients(herb_id);

CREATE INDEX idx_diseases_symptoms_name ON diseases_symptoms(name);
CREATE INDEX idx_sources_slug ON sources(slug);
CREATE INDEX idx_source_pages_source_page ON source_pages(source_id, page_number);
CREATE INDEX idx_citations_entity ON citations(entity_type, entity_id);

-- Trigram indexes for fuzzy search in Vietnamese/Latin names.
CREATE INDEX idx_herbs_name_vn_trgm ON herbs USING GIN (name_vn gin_trgm_ops);
CREATE INDEX idx_herbs_scientific_trgm ON herbs USING GIN (name_scientific gin_trgm_ops);
CREATE INDEX idx_herb_aliases_alias_trgm ON herb_aliases USING GIN (alias gin_trgm_ops);
CREATE INDEX idx_formulas_name_trgm ON formulas USING GIN (name gin_trgm_ops);
CREATE INDEX idx_diseases_symptoms_name_trgm ON diseases_symptoms USING GIN (name gin_trgm_ops);

-- Optional full-text search vectors for editorial text.
CREATE INDEX idx_herb_details_text_search ON herb_details USING GIN (
    to_tsvector('simple', coalesce(description, '') || ' ' || coalesce(uses, '') || ' ' || coalesce(detailed_usage, ''))
);

CREATE INDEX idx_formulas_text_search ON formulas USING GIN (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(indication, '') || ' ' || coalesce(description, ''))
);
