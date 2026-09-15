# Roundtable AI

**Author:** Joe Nasr  
**Canonical identity:** https://joe-nasr-signals.vercel.app/v2/

Roundtable AI is an experimental reasoning interface that sends one problem through fourteen disciplinary lenses, compares the resulting analyses, records disagreement, and produces a synthesis with explicit uncertainty and failure conditions.

The fourteen lenses are software reasoning roles. They are not fourteen human academics, a peer review panel, or a substitute for qualified domain experts.

## Current status

Working prototype.

The application currently includes:

1. Fourteen disciplinary reasoning lenses covering physics, biology, medicine, psychology, psychotherapy, chemistry, mathematics, computer science, robotics, music and sound science, systems science, economics, ethics and governance, and anthropology and sociology.
2. A separate synthesis stage for agreements, conflicts, uncertainty, and failure conditions.
3. Structured claim labels intended to distinguish stronger evidence from interpretation.
4. PDF export and visual comparison components.
5. A server layer and Gemini API configuration.
6. Playwright based application audit tests.

## Evidence boundary

Roundtable AI is a reasoning interface, not an academic review system. Model output can be wrong, incomplete, biased, or based on weak evidence. A disciplinary lens does not become an expert simply because the prompt assigns it a field. Claims that matter should be checked against traceable primary literature, official documentation, or qualified human review.

The output should therefore be read as a structured comparison of model generated perspectives, not as a definitive verdict.

## Run locally

Prerequisite: Node.js.

```bash
npm install
```

Create `.env.local` and add the required Gemini API key using the variable defined in `.env.example`.

```bash
npm run dev
```

Type check:

```bash
npm run lint
```

Application audit:

```bash
npm run qa:audit
```

## Technical stack

React 19, TypeScript, Vite, Express, Recharts, jsPDF, Motion, Playwright, and Gemini API integration.

Repository: https://github.com/Joenasriani/roundtable_ai
