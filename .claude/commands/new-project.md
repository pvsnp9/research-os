---
description: Set up this research-os clone around a given paper (or idea), then preview the site locally and show it.
---

Set up this freshly-cloned research-os repo as a new research project. The user
gives one seed paper (URL, PDF path, or title) and optionally a research
question: $ARGUMENTS

Follow these steps in order. Follow CLAUDE.md throughout.

1. **Understand the seed.** Fetch/read the paper. If only a title was given,
   find its canonical URL (arXiv preferred). Identify: claim, method, datasets,
   metrics, and what is open or weak — you need this for the summary and the
   proposed research question.
2. **Ask once, briefly** (skip anything already given): the project name, and
   whether your proposed one-sentence research question (derived from the
   paper's open problems) matches what they want. Do not ask more than this.
3. **Fill `data/site.js`**: name, question, owner, repo URL (from `git remote
   get-url origin` if set, else leave "").
4. **Register the paper** in `data/resources.js` (status `reading`; summary in
   your own words, never the abstract) and write `notes/<slug>.md` from
   `notes/_template.md` with real content from your reading.
5. **Create `.env`** from `.env.example`; replace CHANGE-ME with the project
   name and create that `$ARTIFACTS` directory. Create the venv only if the
   user wants runs now — not needed for the site.
6. **Propose the first experiment** (usually a reproduction of the paper's key
   number). If the user agrees, register it properly: entry in experiments.js
   as `planned`, full pre-registration in `exps/<slug>.md`, stub entrypoint in
   `src/exps/<slug>.py` and `configs/<slug>.yaml`. Do NOT run it.
7. **Audit and commit.** `python3 tools/audit.py` must pass. Commit everything
   as the project's first commit (message: `new-project: <name>`).
8. **Preview.** Start `python3 -m http.server 8790` in the background from the
   repo root, verify `curl -s localhost:8790/home.html` returns the page, then
   tell the user the URL (http://localhost:8790 — note the editor forwards the
   port automatically in VS Code remote sessions) and summarize what was set
   up: files touched, the research question, and the proposed next step.
