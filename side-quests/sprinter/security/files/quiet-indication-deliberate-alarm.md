# Quiet indication, deliberate alarm

7 May 2026 · Security design study

The electronic-security concept began with two distinct responses: a discreet visual indication for nearby activity and an audible alarm for a stronger event. Keeping those responses separate mattered more than choosing a sensor brand.

The discussion produced a practical brief for comparing components:

| Requirement | Design consequence |
|---|---|
| Different events deserve different responses | Keep the visual indication and audible alarm independently controlled. |
| A vehicle supplies low-voltage power | Compare components that fit that power constraint instead of starting with household mains-powered devices. |
| Detection should cover a limited area | Look for meaningful adjustment of detection range, rather than treating every motion sensor as interchangeable. |
| Notifications must reach the user | Evaluate the complete detection, control and notification path; a sensor listing alone is insufficient. |
| Arming should be convenient | Include a physical control and an explicit armed/disarmed state in the proposed behaviour. |

The false-alarm discussion changed the direction. Normal environmental movement was a reason to reject vibration as the primary trigger. The preferred next approach used motion detection, with the visual indication remaining a separate function.

The AI compared sensor families and drafted possible control arrangements. The useful output was a clearer specification: power, controllability, detection footprint, notification and false-alarm behaviour could be evaluated separately. The study ended at component comparison and proposed behaviour; it did not establish a completed installation or measured detection performance.
