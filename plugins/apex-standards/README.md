# apex-standards

A Claude Code plugin that holds Salesforce Apex work to one set of written standards: FFLIB layering, user-mode security, isolated testing and severity-graded code review. Claude loads each skill automatically when a request matches it.

| Skill               | Use it for                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `apex-fflib-layers` | Writing or restructuring Apex in Trigger / Domain / Selector / Service / Unit of Work layers, plus async pattern selection |
| `apex-security`     | Sharing declarations, `WITH USER_MODE`, `stripInaccessible`, injection-safe SOQL, Named/External Credentials               |
| `apex-testing`      | Stub API unit isolation, a test data factory, 200-record bulk tests, negative paths, async and callout tests               |
| `apex-code-review`  | Reviewing a PR, diff or files, with findings that give a principle, a risk and an exact fix, plus a merge verdict          |

## Install

```text
/plugin marketplace add csquaredaz/claude-code-salesforce-skills
/plugin install apex-standards@csquaredaz
```

There's nothing to configure: the plugin needs no API keys, MCP servers or paid services.
