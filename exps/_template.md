# <title>

Sections up to and including "What would make us distrust a result" are written
and committed BEFORE the run. Results stays empty until the run finishes; every
number in it must exist in results/<slug>/metrics.json. Verdict is computed
against Falsification, never free-typed. Where a diagram helps (the pipeline in
"What we do", competing curves in "What we expect"), embed an inline-SVG
`<figure class="fig">` per docs/figures.md. (Delete this paragraph when copying.)

## In short

One paragraph: what question this answers and why it matters now.

## What we do

Method, data, model, and the exact metric. Config: `configs/<slug>.yaml`.
Entrypoint: `src/exps/<slug>.py`.

## Competing explanations

What else could produce the result we expect, and how the design separates them.

## What we expect

The prediction, with a number where possible.

## Falsification

The result that kills the hypothesis. Fix the tolerance here, before the run.

## What would make us distrust a result

Known weak points: leakage risks, small-n, metric artifacts, implementation doubts.

## Results

## Verdict
