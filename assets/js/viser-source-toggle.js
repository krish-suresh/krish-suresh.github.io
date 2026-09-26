document.querySelectorAll("[data-viser-source-toggle]").forEach((container) => {
  const viewer = container.querySelector("iframe");
  const buttons = container.querySelectorAll("button[data-viser-src]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;

      viewer.src = button.dataset.viserSrc;

      buttons.forEach((option) => {
        const selected = option === button;
        option.setAttribute("aria-pressed", String(selected));
      });
    });
  });
});

document.querySelectorAll(".viser-embed").forEach((container) => {
  const requestFullscreen = container.requestFullscreen || container.webkitRequestFullscreen;
  const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
  if (!requestFullscreen || !exitFullscreen) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "viser-fullscreen-toggle";
  button.setAttribute("aria-controls", container.querySelector("iframe").id);

  const icon = document.createElement("i");
  icon.setAttribute("aria-hidden", "true");
  button.append(icon);
  container.append(button);

  const isFullscreen = () => (document.fullscreenElement || document.webkitFullscreenElement) === container;
  const updateButton = () => {
    const fullscreen = isFullscreen();
    button.title = fullscreen ? "Exit fullscreen" : "Enter fullscreen";
    button.setAttribute("aria-label", button.title);
    icon.className = fullscreen ? "fa-solid fa-compress" : "fa-solid fa-expand";
  };

  button.addEventListener("click", async () => {
    try {
      if (isFullscreen()) {
        await exitFullscreen.call(document);
      } else {
        await requestFullscreen.call(container);
      }
    } catch (error) {
      console.warn("Unable to change visualization fullscreen mode.", error);
    }
  });

  document.addEventListener("fullscreenchange", updateButton);
  document.addEventListener("webkitfullscreenchange", updateButton);
  updateButton();
});
