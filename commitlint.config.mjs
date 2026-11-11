// Conventional Commits, enforced on every PR. The scope list documents the repo's moving parts.
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["apex-standards", "scaffold", "evals", "ci", "docs", "deps"]],
    "body-max-line-length": [0],
  },
};
