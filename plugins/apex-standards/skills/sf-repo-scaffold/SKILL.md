---
name: sf-repo-scaffold
description: Scaffolds a new Salesforce DX repository to the portfolio standards, covering sfdx-project and scratch org definition, Prettier with the Apex plugin, ESLint, Jest, Code Analyzer v5, gitleaks, Conventional Commits, a free-only GitHub Actions CI with scratch-org tests, plus README, CLAUDE.md, ADR, handoff and case-study templates. Run it explicitly when starting a new repo.
when_to_use: "Invoke with /apex-standards:sf-repo-scaffold <repo-name> when creating a new Salesforce repo, bootstrapping sfdx project tooling, or bringing an existing repo up to the shared CI and documentation standard."
argument-hint: "[repo-name]"
disable-model-invocation: true
allowed-tools: Bash(cp -R ${CLAUDE_SKILL_DIR}/templates/sf-repo/. *), Bash(git status *), Bash(git config --get *)
---

# Salesforce repo scaffold

Create the repo skeleton from [templates/sf-repo/](templates/sf-repo/) and fill in every placeholder. This skill writes files, so it only runs when invoked explicitly.

## Steps

1. **Confirm the inputs.** Ask once for anything missing:
   - `REPO_NAME`: the argument, lower-case kebab-case.
   - `ONE_LINE_PURPOSE`: one sentence.
   - `DEPENDENCIES`: `none`, or the package versions it consumes (for example `apex-core-lib@1.0.0-1`).
   - `GITHUB_OWNER`.
   - `API_VERSION`: never assume it. Read `sf org display --target-org <devhub> --json` (`apiVersion`), or ask.
2. **Check the target.** It must be a git repository with no `sfdx-project.json` yet (`git status`). If files would be overwritten, list them and stop for confirmation.
3. **Check the commit identity.** Run `git config --get user.email`. If it isn't a `users.noreply.github.com` address, warn that a public repo would publish it.
4. **Copy the templates:** `cp -R ${CLAUDE_SKILL_DIR}/templates/sf-repo/. <target>/`.
5. **Replace every placeholder** (`{{REPO_NAME}}`, `{{ONE_LINE_PURPOSE}}`, `{{DEPENDENCIES}}`, `{{GITHUB_OWNER}}`, `{{API_VERSION}}`, `{{DATE}}`) in every copied file. Then confirm none are left with `grep -rnE '\{\{[A-Z_]+\}\}' .`. Match only upper-case names, because GitHub Actions `${{ … }}` expressions are legitimate.
6. **Wire dependencies.** For each consumed package, add it to `packageDirectories[0].dependencies` and its `04t…` version Id to `packageAliases` in `sfdx-project.json`. Never invent an Id: ask for it, or leave the dependency out and record it in `handoff.md`.
7. **Create the first feature folder** the user names, as `force-app/<feature>/` with only the metadata subfolders it needs.
8. **Keep or drop `release.yml`.** Ask whether the repo publishes an unlocked package. If it doesn't, delete `.github/workflows/release.yml`, `scripts/changelog-section.sh` and the package keys in `sfdx-project.json` (`package`, `versionName`, `versionNumber`, `versionDescription`, `definitionFile`), because a tag push would otherwise spend a daily package version create.
9. **Report** the created file tree and the exact next commands:

   ```bash
   npm install
   git add -A && git commit -m "chore: scaffold repository from apex-standards"
   ```

   Then list the GitHub secrets CI needs (`SF_JWT_KEY`, `SF_CONSUMER_KEY`, `SF_DEVHUB_USERNAME`) and point to the Dev Hub JWT setup steps in [references/devhub-jwt-setup.md](references/devhub-jwt-setup.md).

## What the scaffold guarantees

| Concern         | How                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formatting      | Prettier + `prettier-plugin-apex` + `@prettier/plugin-xml`, run on staged files by Husky                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Lint            | ESLint 9 flat config with `@salesforce/eslint-config-lwc`                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Static analysis | Code Analyzer v5, `Recommended` rules, CI fails at severity 2 (High) or above. `config/pmd/apex-naming.xml` accepts `method_condition_result` test names                                                                                                                                                                                                                                                                                                                                                                               |
| Secrets         | gitleaks in pre-commit and on full history in CI, plus a rule for secrets stored in Custom Metadata XML                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Commits         | commitlint with Conventional Commits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CI              | Static job first. Scratch-org job (JWT, deploy, the repo's own `<Name>Test` classes via `--class-names`, always delete) only when static passes and the PR isn't a draft. `RunLocalTests` isn't used, because a dependency without a namespace counts as local. The gate measures only the repo's own classes and writes `package-coverage.txt`. It fails on any test failure, on a class no test touches, or below 90%. The step is skipped until a test class exists. `npm run org:test` (`scripts/org-test.sh`) runs the same scope |
| Org budget      | On `main`, the `reuse` job takes the PR's green scratch-org result when the merge commit's tree matches the PR head, so each PR costs one org, not two. A green run that skipped tests (no `apex-test-results` artifact, no test classes in the tree) is reused with empty coverage                                                                                                                                                                                                                                                    |
| Log hygiene     | `scripts/redact-org-details.sh` masks usernames, org and user Ids and instance URLs. Test JSON is scrubbed before upload, and no JUnit file is kept                                                                                                                                                                                                                                                                                                                                                                                    |
| Coverage badge  | The `coverage-badge` job writes `coverage.json` to an orphan `badges` branch, which a shields.io endpoint badge reads. It runs on `main` only and never force-pushes                                                                                                                                                                                                                                                                                                                                                                   |
| Release         | `release.yml`: a `vX.Y.Z` tag builds a beta package version and a pre-release. Promotion is a manual `workflow_dispatch` with `confirm=PROMOTE` that rewrites the notes. A tag without a `## X.Y.Z` section in `CHANGELOG.md` fails before the build, and both jobs add that section to the notes                                                                                                                                                                                                                                      |
| Cost            | Free only: no coverage SaaS, no paid actions, no model calls. Coverage goes to the job summary, an artifact and the badge                                                                                                                                                                                                                                                                                                                                                                                                              |
| Docs            | README in the portfolio's seven-section order, CLAUDE.md, ADR template, handoff, case study, and the MIT `LICENSE` the README declares                                                                                                                                                                                                                                                                                                                                                                                                 |

## Don't

- Don't add a namespace, paid services or extra scratch org features "just in case". Add a feature only when metadata needs it.
- Don't commit `.sf/`, `.sfdx/`, key files or a `server.key`. The template `.gitignore` already excludes them, so don't weaken it.
