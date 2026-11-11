#!/usr/bin/env node
// Offline structural check for every plugin's eval suite. It makes no model calls and runs in CI.
//
// It enforces three things `claude plugin validate` does not:
//   1. Every case loads: a prompt.md or case.yaml with parseable frontmatter, and at least one grader.
//   2. Only free graders are used. `llm` and `baseline` graders call a judge model (paid), so they
//      are rejected here. This is a deliberate choice for this repo; see docs/adr/0002-eval-strategy.md.
//   3. Every model-invocable skill has at least one positive and one negative case, by tag.

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "yaml";

const FREE_GRADERS = new Set(["regex", "tool_used", "tool_order", "file_exists"]);
const errors = [];

const frontmatter = (file) => {
  const text = readFileSync(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try {
    return parse(match[1]) ?? {};
  } catch (e) {
    errors.push(`${file}: frontmatter is not valid YAML (${e.message})`);
    return {};
  }
};

const dirs = (path) =>
  readdirSync(path)
    .map((name) => join(path, name))
    .filter((p) => statSync(p).isDirectory() && !p.endsWith("results"));

const findCases = (path) =>
  dirs(path).flatMap((dir) =>
    existsSync(join(dir, "prompt.md")) || existsSync(join(dir, "case.yaml"))
      ? [dir]
      : findCases(dir),
  );

for (const plugin of dirs("plugins")) {
  const evalDir = join(plugin, "evals");
  const skillsDir = join(plugin, "skills");
  const tagsBySkill = new Map();

  for (const skill of existsSync(skillsDir) ? dirs(skillsDir) : []) {
    const fm = frontmatter(join(skill, "SKILL.md"));
    if (fm["disable-model-invocation"] !== true) tagsBySkill.set(skill.split("/").pop(), new Set());
  }

  const cases = existsSync(evalDir) ? findCases(evalDir) : [];
  for (const dir of cases) {
    const name = relative(evalDir, dir);
    const meta = {
      ...(existsSync(join(dir, "case.yaml"))
        ? parse(readFileSync(join(dir, "case.yaml"), "utf8"))
        : {}),
      ...(existsSync(join(dir, "prompt.md")) ? frontmatter(join(dir, "prompt.md")) : {}),
    };

    const graderDir = join(dir, "graders");
    const graders = existsSync(graderDir)
      ? readdirSync(graderDir).filter((f) => f.endsWith(".md"))
      : [];
    const inline = Array.isArray(meta.graders) ? meta.graders : [];
    if (graders.length + inline.length === 0) errors.push(`${name}: no graders`);

    for (const g of [...graders.map((f) => frontmatter(join(graderDir, f))), ...inline]) {
      if (!FREE_GRADERS.has(g.type)) {
        errors.push(
          `${name}: grader type "${g.type}" is not allowed (free graders only: ${[...FREE_GRADERS].join(", ")})`,
        );
      }
    }

    // Cases are grouped as evals/<skill-name>/<case>/, so the first path segment names the skill.
    const group = name.split("/")[0];
    if (!existsSync(join(skillsDir, group)))
      errors.push(`${name}: group "${group}" does not match a skill directory`);
    for (const t of meta.tags ?? []) tagsBySkill.get(group)?.add(t);
  }

  for (const [skill, seen] of tagsBySkill) {
    for (const kind of ["positive", "negative"]) {
      if (!seen.has(kind)) errors.push(`${plugin}: skill "${skill}" has no ${kind} eval case`);
    }
  }

  console.log(`${plugin}: ${cases.length} eval cases checked`);
}

if (errors.length) {
  console.error(errors.map((e) => `✘ ${e}`).join("\n"));
  process.exit(1);
}
console.log("✔ eval suites are structurally valid and use free graders only");
