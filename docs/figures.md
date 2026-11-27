# Figures

Diagrams in experiment pages (`exps/<slug>.md`) and reading notes
(`notes/<slug>.md`) are **inline SVG** inside a `<figure class="fig">` block.
The markdown renderer passes such a block through untouched when `<figure`
starts at column 0. View this guide rendered at `doc.html?d=figures`.

## Rules

- Draw a figure only when it shows a mechanism or expectation better than the
  prose: a pipeline, what a method keeps vs. discards, competing outcomes.
  Never decoration.
- Colors come **only from tokens** (`var(--...)`) so every figure works in both
  themes. Never raw hex.
- Marks stay neutral (`--surface`, `--seq-1`, `--muted`); the one element the
  text points at takes the highlight classes. One highlight per figure.
- Verdicts are words, never green or red.
- Every `<svg>` carries `role="img"` and an `aria-label` that narrates the
  figure in one or two sentences.
- A figure in a pre-registration shows a *concept or hypothetical outcome*;
  its caption must say so. Empirical plots appear only after the run, generated
  by the entrypoint into `results/<slug>/plots/`.
- A diagram wider than a phone gets `class="fig wide"` and
  `style="--fig-min:520px"` on the svg: it scrolls inside its figure, never the page.

## Classes

- `box` / `box-hi` — rects for components; `-hi` is the highlighted one
- `arrow` / `arrowhead` — connections (muted ink; define one marker per figure)
- `group` — dashed enclosure around related parts
- `cell` / `cell-hi` — small rects for vector/matrix elements
- `t-strong` / `t-hi` — emphasized / highlighted labels; bare `text` is muted
- `key` / `key-hi` — legend chips, used inside the caption

## Example 1 — pipeline (box, box-hi, arrow)

<figure class="fig">
<svg viewBox="0 0 460 70" style="max-width:480px" role="img" aria-label="A seed prompt passes through the guard model, which is highlighted as the component under study, and produces a refusal label.">
  <defs><marker id="f1a" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path class="arrowhead" d="M0 0 L6 3 L0 6"/></marker></defs>
  <g text-anchor="middle">
    <rect class="box" x="10" y="18" width="120" height="34" rx="3"/>
    <text class="t-strong" x="70" y="39">Seed prompt</text>
    <path class="arrow" d="M130 35 H163" marker-end="url(#f1a)"/>
    <rect class="box-hi" x="170" y="18" width="120" height="34" rx="3"/>
    <text class="t-hi" x="230" y="39">Guard model</text>
    <path class="arrow" d="M290 35 H323" marker-end="url(#f1a)"/>
    <rect class="box" x="330" y="18" width="120" height="34" rx="3"/>
    <text class="t-strong" x="390" y="39">Refusal label</text>
  </g>
</svg>
<figcaption><b>The component under study is the only highlighted mark.</b> Everything else stays neutral.</figcaption>
</figure>

## Example 2 — what is kept vs. discarded (cell, cell-hi, key)

<figure class="fig">
<svg viewBox="0 0 360 60" style="max-width:420px" role="img" aria-label="A hidden state drawn as twelve cells; three of them are highlighted as the dimensions the method keeps, the rest are neutral.">
  <text class="t-strong" x="180" y="14" text-anchor="middle">Hidden state</text>
  <g>
    <rect class="cell" x="70" y="24" width="16" height="26" rx="2"/>
    <rect class="cell-hi" x="89" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="108" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="127" y="24" width="16" height="26" rx="2"/>
    <rect class="cell-hi" x="146" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="165" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="184" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="203" y="24" width="16" height="26" rx="2"/>
    <rect class="cell-hi" x="222" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="241" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="260" y="24" width="16" height="26" rx="2"/>
    <rect class="cell" x="279" y="24" width="16" height="26" rx="2"/>
  </g>
</svg>
<figcaption><span class="key key-hi"></span>Kept by the method <span class="key"></span>Discarded</figcaption>
</figure>

## Example 3 — competing expected outcomes (for "What we expect")

<figure class="fig">
<svg viewBox="0 0 420 200" style="max-width:460px" role="img" aria-label="A sketch with metric on the vertical axis and intervention strength on the horizontal axis. Outcome A rises steeply, outcome B stays flat along a dashed baseline.">
  <defs><marker id="f3a" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path class="arrowhead" d="M0 0 L6 3 L0 6"/></marker></defs>
  <path class="arrow" d="M40 170 H400" marker-end="url(#f3a)"/>
  <path class="arrow" d="M40 170 V24" marker-end="url(#f3a)"/>
  <text x="220" y="192" text-anchor="middle">Intervention strength</text>
  <text x="36" y="14">Metric</text>
  <path d="M40 160 C140 152 240 70 390 44" fill="none" stroke="var(--cat-1)" stroke-width="1.5"/>
  <text x="300" y="52" fill="var(--cat-1)">Outcome A: effect is causal</text>
  <path d="M40 150 H390" fill="none" stroke="var(--muted)" stroke-width="1" stroke-dasharray="4 3"/>
  <path d="M40 152 C140 150 240 148 390 144" fill="none" stroke="var(--cat-2)" stroke-width="1.5"/>
  <text x="300" y="136" fill="var(--cat-2)">Outcome B: correlate only</text>
</svg>
<figcaption><b>Hypothetical outcomes — not empirical results.</b> The dashed line is the no-effect baseline fixed in Falsification.</figcaption>
</figure>
