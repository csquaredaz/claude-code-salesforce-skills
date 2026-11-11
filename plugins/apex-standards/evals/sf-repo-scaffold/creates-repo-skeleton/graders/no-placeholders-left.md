---
type: regex
pattern: '\{\{[A-Z_]+\}\}'
match: not_contains
target:
  source: file
  path: README.md
---
