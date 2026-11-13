#!/usr/bin/env bash
# Run this repo's Apex tests, with coverage, in the default (or named) org.
# Usage: npm run org:test [-- <alias>]
#
# RunLocalTests isn't used: a dependency without a namespace (for example apex-core-lib) counts as
# local code, so its packaged tests would run too, and some of them may assert defaults that this
# repo's DI bindings override. This is the same scope CI uses: every <Name>Test class in the
# package directories.
set -euo pipefail

dirs=$(node -p 'require("./sfdx-project.json").packageDirectories.map((d) => d.path).join(" ")')
# shellcheck disable=SC2086,SC2038 # split the directory list on purpose; Apex file names have no spaces
tests=$(find $dirs -name '*Test.cls' -exec grep -li '@istest' {} + | xargs -n1 basename | sed 's/\.cls$//' | sort | paste -sd, -)
if [ -z "$tests" ]; then
  echo "No Apex test classes in the repo yet." >&2
  exit 1
fi

target=()
if [ -n "${1:-}" ]; then
  target=(--target-org "$1")
fi

sf apex run test --class-names "$tests" --code-coverage --result-format human --wait 30 "${target[@]}"
