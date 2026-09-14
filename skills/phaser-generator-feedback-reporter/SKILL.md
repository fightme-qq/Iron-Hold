---
name: phaser-generator-feedback-reporter
description: Use after a task initially failed, required rework, exposed missing generated guidance, or revealed that a better solution should be built into future Phaser Game Creator archives; produce concise generator feedback without editing the generator from inside this game project.
---

# Phaser Generator Feedback Reporter

## Workflow

1. Read `references/feedback-template.md`.
2. Use this skill only after there is evidence: a failed attempt, a confusing agent route, a repeated manual fix, missing template code, missing validation, or a final solution that should have been generated up front.
3. Do not edit the generator from this game repository.
4. Capture the original request, what failed, what finally worked, and why the generated archive did not guide the agent well enough.
5. Classify the generator fix as skill, task map, template module, generated source, validation, docs, visual quality gate, or dependency/config.
6. Include a concrete verification plan for the next generated archive.
7. Give the human a copy-pasteable "Generator Feedback" block.

## Rules

- Do not produce feedback for normal feature work that succeeded cleanly.
- Do not blame the user; focus on missing generator support or missing validation.
- Do not request broad rewrites. Suggest the smallest generator improvement that would prevent the same issue.
- Include file paths from this game only as evidence, not as generator edit targets.
- If the issue is only game-specific design taste, say it should stay in the game and should not change the generator.

