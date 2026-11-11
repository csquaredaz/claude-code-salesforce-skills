# ADR 0001: Host the plugin in a repo-level marketplace under plugins/

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

This repo distributes Claude Code skills that encode Salesforce engineering standards. The first pass has one plugin. A second plugin (role-scoped delivery agents) is planned. Users should be able to install with one marketplace command, and each plugin should version independently.

`claude plugin validate` rejects plugin names that start with `claude-` (reserved, since they pass as Anthropic's own) and warns on `claude` anywhere in a name. The repository name `claude-code-salesforce-skills` describes the content to a human reader but can't be the plugin name.

## Options

1. **Marketplace at the repo root, plugins in `plugins/<name>/`** (chosen). One `marketplace.json` lists every plugin by relative path. Plugins version separately and install separately.
2. **Plugin at the repo root.** This is the simplest layout, but a second plugin would mean either a second repo or a breaking restructure, and the repo root would mix plugin files with repo tooling.
3. **One repo per plugin.** Isolation is clean, but it splits one portfolio piece across several repos, each needing its own CI and README, which works against "readable in 15 minutes".

## Decision

Option 1. The marketplace is named `csquaredaz`, the first plugin is named `apex-standards`, and the repo name stays `claude-code-salesforce-skills`.

## Consequences

- Install is `/plugin marketplace add csquaredaz/claude-code-salesforce-skills`, then `/plugin install apex-standards@csquaredaz`.
- Skills are namespaced `apex-standards:<skill>`, so names stay short and specific.
- CI validates both the marketplace manifest and every plugin under `plugins/`.
- The planned agents plugin adds a sibling directory and a second marketplace entry, with no restructure.
