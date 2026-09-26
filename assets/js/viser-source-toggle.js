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
