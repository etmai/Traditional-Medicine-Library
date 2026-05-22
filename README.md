# Celestial Ring

Celestial Ring is a React + Vite MVP for an Eastern Medicine knowledge web app. It focuses on structured herb profiles, classical prescriptions, pairing rules, and visible safety warnings.

## Current Scope

- Basic and Advanced content modes.
- Herb library with search, use case, property, part-used, and safety filters.
- Herb detail profiles with overview, preparation, pairing, prescriptions, and source tabs.
- Formula builder for herb pairing checks and high-risk interaction alerts.
- Classical prescription library with ingredients, roles, cautions, and linked herb profiles.
- Draft PostgreSQL schema for future CMS/backend integration.

## Data Model

Primary data lives in `src/data`:

- `herbs.js`: materia medica profiles.
- `interactions.js`: pairing rules and contraindications.
- `prescriptions.js`: classical formulas and ingredient roles.
- `taxonomy.js`: filter labels and safety metadata.
- `librarySources.js`: local book/PDF source registry for editorial traceability.

The optimized PostgreSQL schema is in `database_schema.sql`; design notes are in `docs/database-schema-notes.md`.

## PDF Source Workflow

The current local PDFs are scan-based and do not contain usable embedded text. They are registered through ASCII hardlinks in `.source-pdfs/`, which is ignored by Git.

Useful commands:

```bash
python tools/pdf_inventory.py
python tools/pdf_text_extract.py .source-pdfs/cay-thuoc-viet-nam.pdf --pages 10-20 --out extracted-text/cay-thuoc-pages-10-20.txt
```

For the provided scan PDFs, install or provide an OCR layer before large-scale ingestion. A practical path is OCR by chapter, then editorial rewrite into `basic_summary`, `detailed_usage`, `preparation`, `warnings`, and source references.

## Safety Position

This app is educational and editorial. It must not present itself as diagnosis, treatment, or personalized dosage advice. Toxic herbs and high-risk combinations should always be surfaced before any positive recommendation.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

The Vite dev server prefers port `3001` and can fall back to another port if occupied.

## Roadmap

1. Add 30-50 verified herb profiles and editorial review status.
2. Move data to PostgreSQL or a headless CMS such as Strapi.
3. Add prescription-to-herb graph views and stronger compatibility scoring.
4. Add source management, reviewer notes, and publish workflow.
5. Explore chatbot/Q&A only after source governance and medical disclaimers are mature.
