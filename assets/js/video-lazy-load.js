// Keep native controls usable without JavaScript; start muted demos near the viewport.
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const video = entry.target;
        observer.unobserve(video);
        video.play().catch(() => {
          // Native controls remain available if the browser blocks playback.
        });
      });
    },
    { rootMargin: "200px 0px" }
  );

  document.querySelectorAll("video[data-lazy-autoplay]").forEach((video) => observer.observe(video));
}
