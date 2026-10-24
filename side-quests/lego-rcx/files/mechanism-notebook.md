# A spare motor and two touch sensors

Reconstructed concept brief · 2025-04-04

An English reconstruction of the mechanism questions from the working session.

## The starting point

A LEGO RCX 2.0 robot was already assembled on tracks. Two touch sensors and one motor were still available. The question was what new behaviour those parts could add.

## Two directions

| Direction | The design question | What the discussion produced |
|---|---|---|
| A small arm | Could one motor provide a useful lifting or gripping motion? | A four-bar linkage was suggested as a mechanism to investigate. The idea still needed an actual LEGO layout and a way to transmit motion to the gripper. |
| Climbing steps | Could the tracked base negotiate a step? | Discussion of contact with the step, weight distribution and using touch sensors to detect an obstacle. No build sequence was completed. |

The constraint was to work with LEGO and the existing RCX. An initial answer drifted into a generic Arduino arm; the next request brought the discussion back to the actual kit.

## A more specific behaviour

The session ended with a clearer programming target: move forward, detect a yellow line, and turn only if the line stays under the sensor for long enough. That became the separate NQC sketch in this collection.
