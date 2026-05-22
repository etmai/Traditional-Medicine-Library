# Database Schema Notes

This schema merges the current Celestial Ring MVP tables with the database architecture draft from `source-docs/database-architecture.docx`.

## Main Changes

- `herbs` now stores compact, filterable core fields only.
- Long text moved into `herb_details`: description, uses, preparation, dosage, summaries, and modern safety notes.
- `herb_combinations` now follows the pair model from the draft: `herb_a_id`, `herb_b_id`, `combination_type`, `effect`, `is_dangerous`.
- `prescriptions` is normalized as `formulas`, with a compatibility view named `prescriptions`.
- `formula_ingredients` stores dosage and `quan/than/ta/su` role.
- `diseases_symptoms`, `disease_herb_mapping`, and `disease_formula_mapping` support search by user symptom or disease.
- `sources`, `source_pages`, and `citations` support PDF/OCR traceability.
- `editorial_reviews` and `audit_log` support medical content governance.

## Why This Shape

The web app needs two kinds of queries:

- Fast browsing/filtering: by group, nature, flavor, meridian, part used, toxicity, demand, and use case.
- Deep editorial traceability: where a claim came from, which page was OCRed, and whether it has been reviewed.

Separating core fields from long editorial fields keeps the primary `herbs` table easy to query while preserving enough structure for CMS and expert review workflows.

## Migration Hint

The frontend currently uses static files in `src/data`. When moving to a database:

1. Import `herbs.js` core fields into `herbs`.
2. Import summary/preparation/dosage/warnings into `herb_details`.
3. Import `prescriptions.js` into `formulas` and `formula_ingredients`.
4. Import `interactions.js` into `herb_combinations`.
5. Import `librarySources.js` into `sources`.
