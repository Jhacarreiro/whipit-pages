function setMain(main, pip) {
  // UI swap
  mainEl.classList.add("main")
  pipEl.classList.remove("main")

  // audio policy: audio follows main
  pip.mute()
  main.unMute()
  main.setVolume(100)
}
