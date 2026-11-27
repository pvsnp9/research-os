#!/bin/bash
# Usage: sbatch --array=1-$(wc -l < configs/<slug>-grid.txt) \
#          slurm/array.sbatch src/exps/<slug>.py configs/<slug>-grid.txt
# Line N of the grid file becomes the arguments of array task N. Each task writes
# results/<slug>/runs/<task>.json; the entrypoint's --collect step aggregates them.
#SBATCH --account=mzampier
#SBATCH --partition=contrib-gpuq
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=64G
#SBATCH --time=24:00:00
#SBATCH --output=logs/%x-%A_%a.out
set -euo pipefail
source .env
script=$1; grid=$2
args=$(sed -n "${SLURM_ARRAY_TASK_ID}p" "$grid")
exec "${PYTHON:-python3}" "$script" $args
