# ADR 0002: Free-only eval strategy (free graders, run locally, no model calls in CI)

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

`claude plugin eval` scores a plugin against realistic prompts. Every eval run starts a Claude Code agent, so running the suite uses the runner's Claude plan or API account. Two grader types (`llm`, `baseline`) also call a judge model. The other four (`regex`, `tool_used`, `tool_order`, `file_exists`) are computed from the transcript and files at no extra cost.

This repo is a portfolio and demo piece, and it's a hard requirement that it adds **no paid services, API keys or billed CI steps**.

## Options

1. **Free graders only, run locally on the author's existing plan, nothing in CI** (chosen).
2. **Run evals in CI with an `ANTHROPIC_API_KEY` secret and a cost ceiling.** This gives reproducible scores on every PR, but it's a billed step and a stored API key: both explicitly out of scope.
3. **No evals at all, just `claude plugin validate`.** This is free, but it proves only that the files parse, not that the skills trigger or change behaviour.

## Decision

Option 1. The suite uses only free graders. Every model-invocable skill has at least one positive case (the skill fires and the output contains the standard's key markers) and one negative case (the skill stays out of unrelated requests). The user-invoked scaffold skill has an explicit-invocation case and a never-auto-loads case.

## Consequences

- CI runs `scripts/check-evals.mjs`, an offline structural check that fails the build if a case can't load, if any `llm` or `baseline` grader is added, or if a skill lacks a positive or negative case. That way the free-only choice is enforced in code, not just recorded here.
- Regex graders check for the _markers_ of a correct answer (for example `USER_MODE`, `Test.createStub`, a 200-record case), not its overall quality. That's weaker than a rubric judge, and it's the price of zero cost.
- Scores aren't published from CI. When the author runs the suite locally, the summary goes in the PR description.
- Revisit if the repo ever gets a sponsor-funded API budget. The suite can then add `llm` graders and a CI job with `--max-cost-usd`, with no restructuring.
