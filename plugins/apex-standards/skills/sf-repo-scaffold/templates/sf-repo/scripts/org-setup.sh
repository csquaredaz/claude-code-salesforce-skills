#!/usr/bin/env bash
# Create a scratch org, install package dependencies, deploy this repo and assign permissions.
# Usage: npm run org:setup [-- <alias>]   (default alias: the repo name)
# SKIP_PERMSETS=1 leaves the default user without this repo's permission sets, like the org that
# `sf package version create --code-coverage` runs the package's tests in. CI sets it, so a test
# that leans on the running admin's access fails in CI, not in the release build. Source-only repos
# keep it too: tests set up their own users' access.
set -euo pipefail

alias_name="${1:-{{REPO_NAME}}}"

sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias "$alias_name" \
  --set-default \
  --duration-days "${SF_SCRATCH_DURATION:-7}" \
  --wait 15

# Install package dependencies declared in sfdx-project.json (for example apex-core-lib), in order.
node -e '
  const p = require("./sfdx-project.json");
  const deps = (p.packageDirectories.find((d) => d.default) || {}).dependencies || [];
  for (const d of deps) console.log(p.packageAliases[d.package] || d.package);
' | while read -r version_id; do
  [ -n "$version_id" ] || continue
  sf package install --package "$version_id" --target-org "$alias_name" --wait 20 --no-prompt
done

sf project deploy start --target-org "$alias_name" --wait 20

if [ "${SKIP_PERMSETS:-}" = "1" ]; then
  echo "Scratch org '$alias_name' is ready, with no permission sets assigned (SKIP_PERMSETS=1)."
  exit 0
fi

# Assign every permission set in the package directories (the package and any
# unpackaged directory such as example/), so the default user can exercise the features. (find, not
# **, because macOS ships bash 3.2 without globstar.)
dirs=$(node -p 'require("./sfdx-project.json").packageDirectories.map((d) => d.path).join(" ")')
# shellcheck disable=SC2086 # word splitting over the directory list is intended
find $dirs -name '*.permissionset-meta.xml' | while read -r ps; do
  sf org assign permset --name "$(basename "$ps" .permissionset-meta.xml)" --target-org "$alias_name"
done

echo "Scratch org '$alias_name' is ready. Run: npm run org:test"
