---
name: apex-security
description: Applies Salesforce Apex security defaults (sharing declarations, user-mode SOQL and DML, stripInaccessible, injection-safe dynamic SOQL, and Named/External Credentials for callouts) and flags anything that bypasses them. Use when writing or reviewing Apex that reads or writes data, builds queries, makes callouts or stores configuration.
when_to_use: "Triggers: with sharing, without sharing, inherited sharing, fls, crud, field level security, user mode, WITH USER_MODE, WITH SECURITY_ENFORCED, stripInaccessible, soql injection, dynamic soql, named credential, external credential, api key in custom metadata, secure this apex, security review."
---

# Apex security

Default to the running user's access. Bypassing it is an exception that has to be justified in writing.

## Rules

1. **Declare sharing on every class.** Use `with sharing` for services, domains and controllers, and `inherited sharing` for selectors and utilities called from both contexts. Use `without sharing` only with a class-level ApexDoc `@description` that states the reason, the owner and the narrowest scope. A class with no keyword is a finding.
2. **Queries run in user mode.** Use static SOQL `WITH USER_MODE`, and for dynamic SOQL use `Database.queryWithBinds(query, binds, AccessLevel.USER_MODE)`. `WITH SECURITY_ENFORCED` is legacy: replace it when you touch the code, because it ignores polymorphic fields and the WHERE clause, and it fails on the first inaccessible field instead of reporting all of them.
3. **DML runs in user mode.** Use `insert as user records;` or `Database.insert(records, AccessLevel.USER_MODE)`. Use system mode (`as system`) only for documented platform-owned writes, such as a log record the user can't see.
4. **Use `Security.stripInaccessible` when partial access is acceptable.** For example, returning a record to the UI minus fields the user can't read. Check `getRemovedFields()` when removal changes behaviour.
5. **Never concatenate input into SOQL.** Use bind variables via `queryWithBinds`. Dynamic field or object names come from `Schema` describe allowlists, never from raw input. `String.escapeSingleQuotes` is a last resort, not a design.
6. **Callouts use Named Credentials backed by External Credentials.** The endpoint is `callout:Shipping_Carrier/v2/rates`. No URLs, tokens, keys or passwords in Apex, Custom Metadata, Custom Settings, Custom Labels or static resources. Protected Custom Metadata is _not_ secret storage.
7. **Don't log secrets or full payloads containing personal data.** Log identifiers and correlation IDs instead.
8. **Test as a least-privilege user.** Build a user with only the feature's permission set and assert both the allowed path and the denied path with `System.runAs`.

See [references/user-mode-cheatsheet.md](references/user-mode-cheatsheet.md) for syntax and the exception types each mode throws.

## Severity guide for findings

| Finding                                             | Severity |
| --------------------------------------------------- | -------- |
| Secret, token or credential in source or metadata   | Critical |
| Dynamic SOQL built from unescaped input             | Critical |
| Class with no sharing keyword that touches records  | High     |
| `without sharing` with no documented reason         | High     |
| Query or DML in system mode with no reason          | High     |
| `WITH SECURITY_ENFORCED` where `USER_MODE` fits     | Medium   |
| Missing least-privilege test for a data-access path | Medium   |

## Output

For code: apply the rules and add an ApexDoc line on any deliberate exception (for example `@description Runs without sharing: writes platform-owned audit records the user can't see. Owner: platform team.`).

For review: list findings in severity order using the table above, each with the file, the line and the exact fix.
