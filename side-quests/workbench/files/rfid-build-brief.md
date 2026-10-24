# Keep NFC within a small firmware image

Reconstructed brief · 2026-10-24

A reconstructed requirements sheet. Proposed flash commands and unverified flags are intentionally not presented as a finished configuration.

---

## Build constraint

The reader has a 256 KB flash limit. Retain NFC support while investigating which optional protocols can be removed.

## Evidence to keep with a candidate build

- The selected target and enabled protocol list.
- The resulting image size.
- Whether the retained NFC operation still works on the device.

The conversation contains conflicting proposed build flags, including a later suggestion that would remove the required NFC support. No successful final image is preserved here.
