# A bridge to the conversation inside the IDE

Reconstructed brief · 2026-10-24

A reconstructed interaction specification from two working sessions.

---

## Interaction surface

Use the agent conversation already open inside the IDE. A separate model call would create a different conversation.

## Small set of actions

1. Read the latest agent response.
2. Write the next instruction in the correct input.
3. Activate the intended send or action control.

## Design constraint

Target the few required controls without repeatedly scanning the whole screen. Accessibility targets and image recognition were discussed as possible approaches, not demonstrated implementations.

No completed bridge or measured interaction latency is preserved here.
