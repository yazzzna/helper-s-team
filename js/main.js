// Shared UI helpers. All paths are relative so the site works under GitHub Pages project URLs.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener("click", () => { document.body.classList.add("page-leaving"); });
  });
});
window.HelperRoulette = {
  // A decreasing exponential weight gives every integer a chance while favoring smaller prizes.
  weightedInteger(min, max, decay = 0.045) {
    const weights = [];
    let total = 0;
    for (let value = min; value <= max; value++) {
      const weight = Math.exp(-decay * (value - min));
      weights.push({ value, weight }); total += weight;
    }
    let target = Math.random() * total;
    for (const item of weights) { target -= item.weight; if (target <= 0) return item.value; }
    return max;
  },
  formatNumber(value) { return new Intl.NumberFormat("ru-RU").format(value); },
  runNumberSpin({button, stage, valueNode, ticker, status, choose, format, duration = 2600, onDone}) {
    if (button.disabled) return;
    button.disabled = true; stage.classList.add("spinning");
    if (status) status.textContent = "Рулетка вращается…";
    const result = choose();
    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed < duration) {
        valueNode.textContent = format(choose());
        ticker.textContent = ["ИЩЕМ УДАЧУ…", "ЕЩЁ МГНОВЕНИЕ…", "ПОЧТИ ГОТОВО…"][Math.floor(elapsed / 350) % 3];
        requestAnimationFrame(tick);
      } else {
        stage.classList.remove("spinning");
        valueNode.textContent = format(result); ticker.textContent = "РЕЗУЛЬТАТ ЗАФИКСИРОВАН";
        if (status) status.textContent = "Готово! Выпавшее значение — твой результат.";
        button.disabled = false;
        if (onDone) onDone(result);
      }
    };
    requestAnimationFrame(tick);
  }
};