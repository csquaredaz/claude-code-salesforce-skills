# Example: CLAUDE.md for a Salesforce repo that uses apex-standards

Copy this into a Salesforce DX repo as `CLAUDE.md` and edit the stack section. `/apex-standards:sf-repo-scaffold` writes a fuller version automatically.

```markdown
# CLAUDE.md: order-fulfilment

Order fulfilment service for a fictional Orders / Shipments / Customers domain.

## Stack

- Salesforce DX source format, API 68.0, an unlocked package with no namespace.
- Standards plugin: apex-standards. Apply apex-fflib-layers, apex-security and apex-testing to
  all Apex. Run apex-code-review on the branch diff before opening a PR.

## Hard rules

1. Selectors own SOQL, a Unit of Work owns DML, services are stateless, nothing queries in a loop.
2. Every class declares its sharing. Queries and DML run in user mode. Every exception is
   documented in ApexDoc and an ADR.
3. Callouts use Named Credentials. No secrets, org IDs or usernames anywhere in the repo.
4. Tests use Stub API mocks, a 200-record bulk case and negative paths. Coverage is at least 90%
   as a floor.
5. Done means: CI green, no High or Critical Code Analyzer findings, no TODO, ADRs written.

## Workflow

- Plan first: file tree, class list and test plan before code.
- Small Conventional Commits on a feature branch, PR into main, Co-Authored-By trailer on
  AI-assisted commits.
- Update handoff.md at the end of every session.
```

## Why each rule is there

| Rule                      | What it prevents                                                                 |
| ------------------------- | -------------------------------------------------------------------------------- |
| Layer ownership           | Logic spread across triggers and helpers that can't be unit-tested in isolation  |
| User mode by default      | Silent FLS/CRUD bypass, which is the most common Apex security finding           |
| Named Credentials only    | Credentials leaking into metadata, where generic secret scanners often miss them |
| Behaviour-first tests     | Coverage-driven tests that pass whatever the code does                           |
| Written "done" definition | Disagreements at review time about what finished means                           |
