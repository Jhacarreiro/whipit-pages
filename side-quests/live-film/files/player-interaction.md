# A main view and a picture-in-picture view

Interaction proposal · 2025-12-17

English translation of the Portuguese source. An early two-player interaction proposal. The later production plan has three feeds; this draft explores the swap and audio behaviour.

---

The working model is:

1) Two players on the same page\
• Player A loads stream L2.\
• Player B loads stream L1.\
• CSS places B in picture-in-picture (PiP) over A.\
• Clicking the PiP swaps them, either by switching sources or by changing classes and z-index.

2) Audio logic exactly as described\
• Default mode: “audio follows the main view”.\
  When swapping, set `main.muted=false` and `pip.muted=true`.\
• Manual controls: “Mute L1” and “Mute L2” buttons, with optional volume sliders.\
  You can allow both to play at once, but always start with the PiP muted because of browser rules on autoplay with sound.

3) A simple stack for this\
A practical option is HLS in two `<video>` elements with JS on top: hls.js where needed, or native playback in Safari. MDN has an overview of HLS playback in the browser.

To avoid writing a lot of player code, you can use a provider and control it through an API:\
• Cloudflare Stream offers live embeds and a Player API for play, pause, mute, etc.\
• Amazon IVS Player SDK has volume control and lets you place two players side by side using JS.

Two awkward details to account for from the start:\
• Two simultaneous streams mean more bandwidth and client-side CPU use. If that is a problem, lazy-load the PiP so it starts only when clicked, or force it to a lower quality if your pipeline allows it.\
• Perfect synchronisation between L1 and L2 over HLS is difficult. It is fine for glancing at the other feed. If you need tight synchronisation, you are moving into WebRTC, which changes the approach.

In product terms, your site could literally be one page with login, permissions and two signed URLs per level. The rest is UI and a handful of JS.
