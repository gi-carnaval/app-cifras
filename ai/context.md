# AI Context Entry Point

Always read these files before any task:

@ai/rules.md
@ai/architecture.md
@ai/patterns.md
@ai/decisions.md
@ai/glossary.md

Execution priority:

1. rules.md (strict constraints)
2. decisions.md (overrides patterns)
3. patterns.md (implementation guidance)
4. architecture.md (flow understanding)

Before exploring the codebase manually, consult:

- @graphify-out/GRAPH_REPORT.md
- @graphify-out/graph.json

Use Graphify only to understand:
- project structure
- important modules
- file relationships
- dependency direction
- possible impact area

Graphify is NOT a source of architectural rules.

If Graphify conflicts with `/ai` documentation:
- `rules.md` wins over everything
- `decisions.md` wins over patterns and Graphify
- `architecture.md` wins over Graphify structure interpretation
- Graphify is only a navigation aid

If conflict exists:
- rules override everything
- decisions override patterns