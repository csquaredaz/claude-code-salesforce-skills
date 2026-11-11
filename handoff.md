# Handoff: claude-code-salesforce-skills

Last updated: 2026-11-11 · Phase: step 0 (first pass) of the portfolio roadmap

## Done

- Private repo created with an MIT license. Commits use the GitHub noreply identity.
- Tooling: Prettier, markdownlint, commitlint (Conventional Commits), Husky + lint-staged, gitleaks with a custom Custom Metadata secret rule.
- CI (free only): lint, commitlint, `claude plugin validate --strict` (offline), eval structure check, and a gitleaks full-history scan.
- Plugin `apex-standards` 0.1.0 in marketplace `csquaredaz`, with five skills: `apex-fflib-layers`, `apex-security`, `apex-testing`, `apex-code-review`, and `sf-repo-scaffold` (user-invoked only).
- Scaffold templates smoke-tested in a scratch repo: format, lint, Jest and Code Analyzer all pass.
- Eval suite: 10 cases, free graders only, with a positive and a negative case per skill.
- ADRs 0001 (layout and naming) and 0002 (free-only evals). README in the seven-section format. Example CLAUDE.md.

## Next

1. **Owner action:** grant the `gh` token the `workflow` scope (`gh auth refresh -h github.com -s workflow`) so branches containing `.github/workflows/` can be pushed. Then push the stacked branches and open PRs in order: `build/repo-tooling` → `feat/apex-standards-skills` → `feat/repo-scaffold` → `test/eval-suite`.
2. Optional, owner's choice: run the eval suite locally once (`claude plugin eval plugins/apex-standards --runs 1 --ablation none`, adding `--scaffold --allow-tools Bash Write Edit` for the scaffold case) and paste the summary into the eval PR.
3. Start repo A (`apex-core-lib`) with `/apex-standards:sf-repo-scaffold apex-core-lib`, after the Dev Hub JWT setup in `plugins/apex-standards/skills/sf-repo-scaffold/references/devhub-jwt-setup.md`.

## Final pass (roadmap step 6), not started

- Second plugin `sf-delivery-agents` with role-scoped agents.
- Hooks: for example, Prettier on Apex after Edit/Write.
- PR-review demo: `apex-code-review` reviewing a real PR in `apex-event-ingestion`.
- `docs/case-study.md`.
- Plugin icon (only needed for a directory submission).

## Open decisions

| Decision                                   | Options                                                                                                                         | Leaning                                 | Needed by            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------- |
| Coverage badge for Salesforce repos (free) | (a) shields.io endpoint badge from a JSON file CI commits to a `badges` branch, (b) Codecov free OSS tier, (c) job summary only | (a): no third-party account, fully free | Repo A, first CI run |
| FFLIB core in repo A                       | Lean in-repo core vs vendored upstream `fflib-apex-common`                                                                      | Lean core                               | Repo A, session 1    |

## Notes for the next session

- `claude plugin validate` rejects plugin names starting with `claude-`, and warns on the word "claude" anywhere.
- A free Developer Edition Dev Hub can't create new Connected Apps, so the CI template uses an External Client App with `SF_SCRATCH_SIGNUP_CONNECTED_APP=PlatformCLI` (CLI 2.147.7 or later).
- The Dev Hub budget is 3 active and 6 daily scratch orgs, and 6 package versions per day.
