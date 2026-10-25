// Общие мелкие эффекты. Вся логика работает на стороне браузера — сервер не нужен.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
});
