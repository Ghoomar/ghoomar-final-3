# Claude Behavior Instructions

## Planning + Execution Model Split ("opus plan")

When the user includes the phrase **"opus plan"** anywhere in their prompt, follow this two-phase approach — do not ask for confirmation, just do it:

1. **Plan with Opus**: Spawn a `Plan` subagent using `model: "opus"` to think through the approach, identify affected files, and produce a step-by-step implementation plan.
2. **Execute with Sonnet**: Carry out the plan yourself (Sonnet) based on the output from the Opus planning agent.

If the user does NOT say "opus plan", behave normally without spawning a planning agent.
