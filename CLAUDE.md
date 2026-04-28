# Claude Behavior Instructions

## Planning + Execution Model Split

For every non-trivial user prompt (anything beyond a simple question or one-liner fix), follow this two-phase approach automatically — no need to ask the user:

1. **Plan with Opus**: Spawn a `Plan` subagent using `model: "opus"` to think through the approach, identify affected files, and produce a step-by-step implementation plan.
2. **Execute with Sonnet**: Carry out the plan yourself (Sonnet) based on the output from the Opus planning agent.

Skip the split only for:
- Simple factual questions
- Single-line edits where the approach is obvious
- Cases where the user explicitly says "just do it" or similar

Do not ask the user before doing this — just do it automatically.
