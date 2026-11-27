// Hand-edited experiment registry, newest first. Body must stay strict JSON
// (double quotes, null not None, no trailing commas) — tools/audit.py parses it.
//
// One entry per experiment. The slug ties everything together:
//   exps/<slug>.md  src/exps/<slug>.py  results/<slug>/  $ARTIFACTS/{models,runs}/<slug>/
//
// status:  "planned" | "running" | "done" | "abandoned"
// stage:   "preliminary" | "main" | "replication"
// ran_by:  "AI-run" | "AI-assisted" | "hand-run"
// review:  "unreviewed" | "reviewed"   — only the human owner sets "reviewed"
// commit:  git hash pinned when the run is submitted; verdict set only at done:
// verdict: "supported" | "refuted" | "inconclusive"
window.EXPERIMENTS = [
];
