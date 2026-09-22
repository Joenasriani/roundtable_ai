# Roundtable AI

Roundtable AI is an experimental multi-lens reasoning interface created by Joe Nasr. It sends a single problem through fourteen disciplinary reasoning lenses, preserves each lens's independent analysis, then compares agreements, conflicts, assumptions, missing evidence, uncertainty, and failure conditions before generating a synthesis.

Conflicting interpretations remain visible rather than being forced into consensus.

Joe Nasr:
https://joe-nasr-signals.vercel.app/

The fourteen lenses are software reasoning roles. They are not fourteen human academics, a peer review panel, or a substitute for qualified domain experts.

## Current status

Working prototype.

The application currently includes:

1. Fourteen disciplinary reasoning lenses covering physics, biology, medicine, psychology, psychotherapy, chemistry, mathematics, computer science, robotics, music and sound science, systems science, economics, ethics and governance, and anthropology and sociology.
2. A separate comparison and synthesis stage for agreements, conflicts, uncertainty, and failure conditions.
3. Model assigned evidence labels that remain subject to source verification.
4. PDF reasoning record export and visual comparison components.
5. OpenRouter access through either a user supplied key or the managed server route.
6. Playwright application audit tests.

## Evidence boundary

Roundtable AI is a reasoning interface, not an academic review system. Model output can be wrong, incomplete, biased, or based on weak evidence. A disciplinary lens does not become an expert simply because the prompt assigns it a field. Evidence labels and confidence values are model reported fields and are not independently calibrated. Claims that matter should be checked against traceable primary literature, official documentation, or qualified human review.

The output is a structured comparison of model generated perspectives, not a definitive verdict.

## Run locally

Prerequisite: Node.js.

```bash
npm install
```

For direct user key mode, provide an OpenRouter API key through the interface. For the managed server route, configure `OPENROUTER_API_KEY` or the supported deployment alias documented in the server code.

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

React 19, TypeScript, Vite, Express, Recharts, jsPDF, Motion, Playwright, PayPal, and OpenRouter.

Repository: https://github.com/Joenasriani/roundtable_ai