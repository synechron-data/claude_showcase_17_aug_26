# Claude Code Showcase

Personal workspace and reference materials built around a "Claude Code Capabilities" session — a live demo API project plus supporting reference notes.

## Repository structure

```
.
├── demo-project/   Node.js/Express JWT authentication API — the live demo project.
│                   Intentionally contains planted bugs to showcase Claude Code's
│                   debugging, review, and fix workflows. See demo-project/README.md
│                   and demo-project/CLAUDE.md for full architecture and usage.
└── notes/          Reference PDFs covering Claude Code slash commands, model flows
                     and model guide, session management, tools reference, and the
                     installation guide.
```

## Getting started

The runnable code lives in `demo-project/`. To get it running:

```bash
cd demo-project
npm install
cp .env.example .env
npm test
npm run dev
```

See `demo-project/README.md` for the full API reference and quick start details.
