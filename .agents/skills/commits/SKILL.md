---
name: commits
description: Rules and formatting for git commits following web standards and Conventional Commits with scopes. Activate this skill whenever the user asks to save code in git or make commits.
---
# Skill: commits

## Purpose
Enforce Conventional Commits specification with standardized scopes for modern web projects, ensuring a clean, readable, and automated-changelog-friendly Git history.

## When to Use
Any commit creation, review, or branch cleanup.

## Format
```text
type(scope): description

[optional body]

[optional footer(s)]
```

## Valid Types

| Type     | Use For                                                   |
|----------|-----------------------------------------------------------|
| feat     | New feature, component, or user-facing behavior           |
| fix      | Bug fix, patch, or error resolution                      |
| docs     | Documentation only (README, JSDoc, architecture guides)   |
| chore    | Maintenance, dependencies, build configs, tool updates   |
| refactor | Code restructuring without changing external behavior    |
| test     | Adding, updating, or fixing tests                         |
| ci       | CI/CD workflows, GitHub Actions, pipeline configuration   |
| style    | Formatting, CSS/Tailwind tweaks, no logic changes         |
| perf     | Performance improvements, asset optimization              |
| build    | Bundler changes (Vite, Astro, pnpm, TSConfig)             |
| revert   | Reverting a previous commit                               |

## Standard Web Scopes

Always use lowercase scopes representing the specific module or architectural layer:

| Scope          | Target Area / Responsibility                                      |
|----------------|-------------------------------------------------------------------|
| `domain`       | Domain entities, value objects, core business models, ports/types |
| `app`          | Application use cases, DTOs, business orchestration               |
| `infra`        | Adapters, technical services, external APIs                       |
| `converter`    | Parsing, transformation engines, serializers                      |
| `security`     | Sanitization, input validation, XSS prevention                    |
| `ui`           | Presentation layer, views, visual components                      |
| `components`   | Reusable UI widgets, buttons, modals, dropzones                   |
| `styles`       | Global CSS, Tailwind configurations, design tokens                |
| `state`        | Store, state managers, signals, reactive context                  |
| `deps`         | Package additions, removals, or version bumps                    |
| `config`       | Project configurations (`astro.config`, `tsconfig`, etc.)        |
| `tests`        | Unit tests, integration tests, fixtures                           |
| `docs`         | Guides, specifications, architecture documentation                |

*(If a change affects a very specific module not listed above, use a clear, concise lowercase noun, e.g. `feat(clipboard): ...` or `feat(zip): ...`).*

## Critical Rules
1. **ALWAYS USE SCOPES**: Follow `type(scope): description`. Scopes must be lowercase, enclosed in parentheses, and immediately follow the type without spaces (e.g., `feat(ui): add visual preview` instead of `feat: add preview`).
2. **LOGICAL COHESION**: Each commit must represent a single logical unit of work. Coupled files for a single component or use case (e.g., component + its styles or entity + its port) should be committed together. Never batch unrelated files or use blanket `git add -A`.
3. **NO AI ATTRIBUTION TRAILERS**: NEVER include `Co-Authored-By`, `Generated-by`, or any AI attribution markers.
4. **IMPERATIVE MOOD**: Write descriptions in the imperative present tense: "add" not "added", "fix" not "fixed", "update" not "updated".
5. **CASE & PUNCTUATION**: The description after the colon and space must start with lowercase and end without a period:
   - `feat(security): implement svg sanitizer`
6. **LINE LENGTH**: Keep the commit subject line ≤ 72 characters.
7. **OPTIONAL BODY**: When additional context or rationale is necessary, add a blank line after the subject followed by a clear explanatory body.

## Good Examples

```text
feat(security): implement 4-layer svg validator and sanitizer
feat(converter): add basic shapes to path data transformer
feat(ui): create drag and drop zone with strict mime filter
feat(components): add 1-click xml copy button with visual feedback
feat(infra): integrate jszip service for bulk xml export
fix(converter): resolve operator precedence in dimension calculation
test(domain): add unit tests for android resource file naming
style(ui): apply android green palette and dark mode accents
chore(deps): update astro and tailwind dependencies
chore(config): configure pnpm and tsconfig path aliases
docs(architecture): add clean architecture and solid principles guide
```

## Anti-patterns

```bash
# BAD — missing scope
git commit -m "feat: add dropzone component"

# BAD — uppercase scope or trailing period
git commit -m "feat(UI): add dropzone component."

# BAD — committing unrelated files across multiple layers at once
git add -A && git commit -m "fix(app): fix several bugs and update styles"

# BAD — past tense
git commit -m "fix(security): fixed xss vulnerability"

# BAD — AI attribution
git commit -m "feat(ui): add preview card

Co-Authored-By: Claude <claude@anthropic.com>"

# BAD — vague message
git commit -m "chore(config): updates"
```