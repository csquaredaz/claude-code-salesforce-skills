# CLAUDE.md: claude-code-salesforce-skills

Standards for working in this repo. They apply to every Claude Code session here.

## What this repo is

A Claude Code marketplace (`csquaredaz`) that hosts one plugin, `plugins/apex-standards`. Its skills encode the Apex engineering standards used across the portfolio repos: FFLIB layering, security, testing, code review and repo scaffolding.

## Hard rules

1. **Clean-room content.** No code, names, object models, comments or data from any employer or client. Examples use the fictional Orders / Shipments / Customers domain.
2. **Free only.** No paid services, API keys, model-judged eval graders (`llm`, `baseline`) or CI steps that call a model. When a paid option is deliberately left out, say so in a comment where a reader would look for it.
3. **No secrets.** No credentials, org IDs, usernames or webhook URLs. gitleaks runs in pre-commit and CI with `.gitleaks.toml`.
4. **Lower-case, kebab-case** for every folder and file name, except `SKILL.md`, `README.md`, `CLAUDE.md` and `LICENSE`.
5. **Names never start with `claude-`.** Plugin names starting with `claude-` are reserved and fail `claude plugin validate`.

## Skill authoring

- `description` leads with the use case, and `description` plus `when_to_use` stays under 1,536 characters.
- `SKILL.md` stays under 200 lines (the hard limit is 500). Detail goes in `references/` and is linked from `SKILL.md`.
- State rules as imperatives with the reason in one clause. No narrative.
- Every skill has at least one positive eval case and one negative case under `plugins/apex-standards/evals/`, using only free graders (`regex`, `tool_used`, `tool_order`, `file_exists`).
- Current platform defaults: API 68.0, `WITH USER_MODE` over `WITH SECURITY_ENFORCED`, the `Assert` class over `System.assert*`, and Named and External Credentials for every callout.

## Workflow

- Branch per feature (`feat/…`, `build/…`, `docs/…`), PR into `main`, merge commit so the small commits stay visible.
- Conventional Commits with scopes from `commitlint.config.mjs`.
- AI-assisted commits keep the `Co-Authored-By: Claude` trailer.
- Before pushing: `npm run lint` and `claude plugin validate --strict plugins/apex-standards`.
- At the end of a session, update `handoff.md` with what's done, what's next and any open decisions.
