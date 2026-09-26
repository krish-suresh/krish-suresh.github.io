document.querySelectorAll("[data-video-source-toggle]").forEach((container) => {
  const video = container.querySelector("video");
  const buttons = container.querySelectorAll("button[data-video-src]");

  function playVideo() {
    video.play().catch(() => {
      // Native controls remain available if the browser blocks playback.
    });
  }

  function selectVideo(button, shouldPlay) {
    video.pause();
    video.src = button.dataset.videoSrc;
    video.load();

    buttons.forEach((option) => {
      const selected = option === button;
      option.setAttribute("aria-pressed", String(selected));
    });

    if (shouldPlay) playVideo();
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;
      selectVideo(button, !video.paused && !video.ended);
    });
  });
});
