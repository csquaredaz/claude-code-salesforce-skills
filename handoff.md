# Handoff: claude-code-salesforce-skills

Last updated: 2026-11-13 · Phase: between roadmap steps. A and B are done and public; C (`apex-event-ingestion`) is next. The step 6 final pass hasn't started.

## Done

- Private repo created with an MIT license. Commits use the GitHub noreply identity.
- Tooling: Prettier, markdownlint, commitlint (Conventional Commits), Husky + lint-staged, gitleaks with a custom Custom Metadata secret rule.
- CI (free only): lint, commitlint, `claude plugin validate --strict` (offline), eval structure check, and a gitleaks full-history scan.
- Plugin `apex-standards` 0.1.0 in marketplace `csquaredaz`, with five skills: `apex-fflib-layers`, `apex-security`, `apex-testing`, `apex-code-review`, and `sf-repo-scaffold` (user-invoked only).
- Eval suite: 10 cases, free graders only, with a positive and a negative case per skill.
- ADRs 0001 (layout and naming) and 0002 (free-only evals). README in the seven-section format. Example CLAUDE.md.
- PRs #1–#7 (2026-11-11): first pass. Repaired a stacked-PR mistake (#5) and required CLI 2.147.7+ for the JWT smoke test (#7).
- **PR #8** (merged 2026-11-12): back-ported apex-core-lib's proven CI to the scaffold template. It added the `reuse` job, the `test-result-<runId>.json` fix, the test skip before any tests exist, the coverage gate and badge, org-detail redaction, `release.yml`, and a PMD ruleset for `method_condition_result` test names.
- **PR #9** (merged 2026-11-12): the template ships the MIT `LICENSE` its README declares. A `cmp` drift guard in `npm run check:templates` keeps it identical to the repo's own.
- **B back-port** (`ci/scaffold-backport-b`, 2026-11-13). What B and A proved, applied to the template before C's scaffold:
  - `sfdx-project.json`: `versionDescription` and `definitionFile`, which a package version build needs.
  - `ci.yml`: runs only the repo's own `<Name>Test` classes with `--class-names` and gates on the repo's own classes (`package-coverage.txt`, read by the reuse job), replacing `RunLocalTests`. It fails on a class no test touches. The skip before any tests exist stays.
  - The reuse job now reuses a green run that has no `apex-test-results` artifact (checked through the artifacts API) when the identical tree has no test classes. Coverage is empty, so the badge job skips.
  - `scripts/org-test.sh` (`npm run org:test`) uses the same test scope as CI.
  - `CHANGELOG.md` (header only), `scripts/changelog-section.sh` (identical to A's) and the `release.yml` gate: a tag without a section fails before the build, and both jobs add the section to the notes.
  - `commitlint.config.mjs` broke the template's own `trailingComma: none`. The format and lint-staged globs skipped `.mjs`, which is why nothing caught it. Both are fixed.
  - Kept unchanged: `redact-org-details.sh` and the result scrubbing (B's going-public audit found them sufficient).

## How the back-port was verified (no scratch orgs)

- Filled-template smoke test: 0 placeholders left, then `npm install`, `format:check`, `lint`, `test:unit`, `analyze` (1 Low), `shellcheck`, a JSON parse, and commitlint on a good and a bad message. `format:check` fails when the trailing comma is put back.
- `actionlint` reports the same shellcheck notes on the filled workflows as on B's (SC1083, SC2016, SC2038). Nothing new.
- Diffed against B: `release.yml` differs only in one comment; `changelog-section.sh` and `redact-org-details.sh` are identical; `org-setup.sh` and `package.json` differ only in the name and the `.mjs` glob.
- Reuse step pulled out of the YAML and run on four fixture repos with a stub `gh`: artifact present → reuse with coverage; no artifact and no tests → reuse with empty coverage; no artifact but tests present → fresh org; tree changed → fresh org.
- Artifacts API checked on B's real public runs: run 43498363530 lists 1 `apex-test-results`; B's scaffold PR run 43309239443 (green scratch-org job, no tests) lists 0.
- Test step run on B's tree with a stub `sf` that returns B's real artifact. It reported 100% package coverage over 19 classes, matching B's own `package-coverage.txt`; a class no test touches fails the gate. On the same tree, `org-test.sh` picks the same 20 test classes as CI.
- `changelog-section.sh` fixtures: a present section prints, the last section prints to EOF, and missing or empty sections exit 1. The template `CHANGELOG.md` has no section, so it exits 1.
- **Not yet proven:** the real CI paths, the reuse fallback on a real `main` push, `--class-names` against a real org, and the release gate on a real tag. C's scaffold PR (no tests, so no artifact) and its first test PR and release will prove them.

## Next

1. **Repo C** (`apex-event-ingestion`, roadmap step 3): scaffold with `/apex-standards:sf-repo-scaffold apex-event-ingestion`, plan first. It depends on apex-core-lib `1.1.0-1` (`04tak000000u3MbAAI`).
2. Optional, owner's choice: run the eval suite locally once (`claude plugin eval plugins/apex-standards --runs 1 --ablation none`, adding `--scaffold --allow-tools Bash Write Edit` for the scaffold case) and paste the summary into a PR.

## Final pass (roadmap step 6), not started

- Second plugin `sf-delivery-agents` with role-scoped agents.
- Hooks: for example, Prettier on Apex after Edit/Write.
- PR-review demo: `apex-code-review` reviewing a real PR in `apex-event-ingestion`.
- `docs/case-study.md`.
- Plugin icon (only needed for a directory submission).

## Open decisions

None. The coverage badge (shields.io endpoint on a `badges` branch) and a lean in-repo FFLIB core were both decided in repo A.

## Notes for the next session

- **No stacked PRs.** Every PR targets `main`; the next branch starts only after the previous merge.
- `claude plugin validate` rejects plugin names starting with `claude-`, and warns on the word "claude" anywhere.
- E's own lint skips `templates/` on purpose (`.prettierignore`). Check template formatting by filling it into a scratch repo and running its `format:check`.
- A free Developer Edition Dev Hub can't create new Connected Apps, so the CI template uses an External Client App with `SF_SCRATCH_SIGNUP_CONNECTED_APP=PlatformCLI` (CLI 2.147.7 or later).
- The Dev Hub budget is 3 active and 6 daily scratch orgs, and 6 package versions per day.
