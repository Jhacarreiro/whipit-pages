# A YouTube-based proof of concept

Prototype proposal · 2025-12-17

English translation of the Portuguese source. Draft architecture and a small JavaScript sketch, not a recovered working player.

---

There is one key point: for **clickable PiP with swapping and automatic muting**, you need **your own page**, even a simple static one, embedding **two YouTube iframes** and controlling them through the **YouTube IFrame Player API**. That lets you call `mute()` and `unMute()` on a click.

### The working pattern
1) Run two YouTube live streams:\
L1 unlisted, L2 unlisted.

2) Render both players on your site:\
one large, with a smaller one over it.

3) Clicking the PiP swaps the views, and audio follows the main view.\
In the click handler:
- Swap the classes for the main and PiP views.
- `big.unMute(); big.setVolume(100)`
- `pip.mute()`

Browsers allow autoplay with sound only after a user gesture, so start everything muted and enable sound on the click.

### “Can both audio feeds play at once?”
Yes. Technically, you just leave the PiP unmuted and control the volumes. The YouTube API supports this.\
In practice, it is usually chaotic because of echo and some timing difference between the streams. Fine for a proof of concept; for production, I would keep it as an advanced mode.

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
