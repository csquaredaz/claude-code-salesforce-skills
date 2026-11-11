---
name: apex-code-review
description: Reviews Salesforce Apex and metadata changes, such as a pull request, branch diff or set of files, and produces severity-graded findings, each with a principle, a risk and an exact fix, plus a merge verdict. Applies the apex-fflib-layers, apex-security and apex-testing standards. Use when asked to review Apex, a PR, or a diff before merge.
when_to_use: "Triggers: review this apex, review my PR, code review, pr review, review the diff, is this ready to merge, check this class, find problems in this trigger, review this branch."
allowed-tools: Bash(gh pr diff *), Bash(gh pr view *), Bash(git diff *), Bash(git log *)
---

# Apex code review

Every finding names the violated rule, the failure it causes and the exact fix. A comment without a fix is feedback, not a finding.

## Process

1. **Get the change.** For a PR, run `gh pr view <n>` and `gh pr diff <n>`. For a branch, run `git diff main...HEAD`. For files, read them. Read whole files around each hunk: layer violations are rarely visible in the hunk alone.
2. **Establish intent.** Read the PR description and any linked ADR. A deliberate, documented deviation isn't a finding, but an undocumented one is.
3. **Review in layer order:** trigger → domain → selector → service → Unit of Work usage → async → tests. Layer violations found early explain defects found later.
4. **Apply the standards:**
   - Layering and bulk safety, from the `apex-fflib-layers` skill.
   - Sharing, user mode, injection and credentials, from the `apex-security` skill.
   - Test quality, from the `apex-testing` skill. Judge whether the tests would fail if the behaviour broke, not what the coverage figure says.
   - Plus: error handling (no empty catch, typed exceptions, nothing swallowed), no hard-coded Ids or URLs, ApexDoc on public classes, no `TODO` or commented-out code.
5. **Grade and write findings** using the format below, ordered by severity.
6. **Give a verdict.**

## Severity

| Severity | Meaning                                                                                           | Merge                    |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| Critical | Security exposure, data loss, governor failure at 200 records, secret in source                   | Blocks                   |
| High     | Logic defect, layer violation that defeats testability, swallowed exception, test that can't fail | Blocks                   |
| Medium   | Pattern drift, missing bulk or negative test, hard-coded value, legacy security syntax            | Fix or justify in the PR |
| Low      | Naming, ApexDoc gaps, readability                                                                 | Non-blocking             |

## Finding format

```text
[HIGH] OrdersService.cls:42, fulfil()
Finding:   SOQL inside the for-loop over orders.
Principle: Selectors own all queries; no SOQL in loops (apex-fflib-layers rule 7).
Risk:      Throws System.LimitException: Too many SOQL queries: 101 when more than 100 orders arrive in one trigger chunk.
Fix:       Collect order Ids before the loop and call ordersSelector.selectByIdWithLines(orderIds) once; iterate the map.
```

## Report

```text
## Review summary
Verdict:  Changes requested | Approved with comments | Approved
Findings: 0 Critical · 2 High · 1 Medium · 3 Low
Strongest aspect: <one sentence>
Main concern:     <one sentence>

## Findings
<findings in severity order>
```

Rules for the verdict: any Critical or High finding means **Changes requested**. "Approved with reservations" isn't a verdict. Don't invent findings to look thorough: an empty findings list with an **Approved** verdict is a valid review.

When asked to post the review to GitHub, show the report first and post only after confirmation.
