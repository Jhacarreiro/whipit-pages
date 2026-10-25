# A YouTube-based proof of concept

Prototype proposal · 2025-12-17

English translation of the Portuguese source. Draft architecture and a small JavaScript sketch, not a recovered working player.

---

The proposed **clickable PiP with swapping and automatic muting** uses a dedicated page with **two YouTube iframes**, controlled through the **YouTube IFrame Player API**. The click handler calls `mute()` and `unMute()`.

### The working pattern
1) Run two YouTube live streams:\
L1 unlisted, L2 unlisted.

2) Render both players on the page:\
one large, with a smaller one over it.

3) Clicking the PiP swaps the views, and audio follows the main view.\
In the click handler:
- Swap the classes for the main and PiP views.
- `big.unMute(); big.setVolume(100)`
- `pip.mute()`

Browsers allow autoplay with sound only after a user gesture, so start everything muted and enable sound on the click.

### Simultaneous audio
Both feeds can play by leaving the PiP unmuted and controlling the volumes. The YouTube API supports this.\
In practice, it is usually chaotic because of echo and some timing difference between the streams. The proposal keeps simultaneous audio as an advanced mode beyond the proof of concept.

### A small logic skeleton (concept)
```js
function setMain(main, pip) {
  // UI swap
  mainEl.classList.add("main")
  pipEl.classList.remove("main")

  // audio policy: audio follows main
  pip.mute()
  main.unMute()
  main.setVolume(100)
}
```
