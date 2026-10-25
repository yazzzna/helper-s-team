(() => {
  const modes = {
    normal: { cost: 35, max: 65, label: "Обычная рулетка" },
    super: { cost: 45, max: 90, label: "Супер-рулетка" },
    mega: { cost: 55, max: 150, label: "Мега-рулетка" }
  };
  let selected = "normal", busy = false;
  const buttons = [...document.querySelectorAll("[data-mode]")];
  const spinButton = document.getElementById("spinButton");
  const track = document.getElementById("slotTrack");
  const resultValue = document.getElementById("resultValue");
  const caption = document.getElementById("resultCaption");
  const message = document.getElementById("resultMessage");
  const costNote = document.getElementById("costNote");
  const panel = document.querySelector(".spin-panel");

  // Веса плавно снижаются с ростом выигрыша, но не обнуляются:
  // вес = 1 / (1 + (приз / 0.58 от максимума)^1.7). Это оставляет крупным призам
  // заметный шанс и делает небольшие выигрыши более частыми.
  function weightedInteger(max) {
    const weights = [];
    let total = 0;
    for (let n = 0; n <= max; n++) {
      const weight = 1 / (1 + Math.pow(n / (max * 0.58), 1.7));
      weights.push(weight); total += weight;
    }
    let pick = Math.random() * total;
    for (let n = 0; n <= max; n++) { pick -= weights[n]; if (pick <= 0) return n; }
    return max;
  }
  const fmt = n => n.toLocaleString("ru-RU");
  buttons.forEach(button => button.addEventListener("click", () => {
    if (busy) return;
    selected = button.dataset.mode;
    buttons.forEach(b => b.classList.toggle("active", b === button));
    const mode = modes[selected];
    document.documentElement.style.setProperty("--accent", "#00ffff");
    costNote.textContent = `Стоимость прокрутки: ${mode.cost} баллов`;
    resultValue.textContent = "—"; caption.textContent = "ГОТОВ К ЗАПУСКУ";
    message.textContent = `Диапазон выигрыша: 0–${mode.max} баллов.`;
    track.querySelectorAll(".winner").forEach(el => el.classList.remove("winner"));
  }));
  function buildStrip(finalValue) {
    track.innerHTML = "";
    const values = [];
    for (let i = 0; i < 28; i++) values.push(Math.floor(Math.random() * (modes[selected].max + 1)));
    values.push(finalValue);
    for (let i = 0; i < 5; i++) values.push(Math.floor(Math.random() * (modes[selected].max + 1)));
    values.forEach((value, index) => {
      const span = document.createElement("span"); span.textContent = fmt(value);
      if (index === 28) span.classList.add("winner");
      track.appendChild(span);
    });
    track.style.transition = "none"; track.style.transform = "translateX(0px)";
    // Force reflow before applying the animation.
    void track.offsetWidth;
    const target = track.children[28];
    const frame = track.parentElement;
    const offset = target.offsetLeft + target.offsetWidth / 2 - frame.clientWidth / 2;
    track.style.transition = "transform 4.2s cubic-bezier(.08,.72,.12,1)";
    track.style.transform = `translateX(${-offset}px)`;
  }
  spinButton.addEventListener("click", () => {
    if (busy) return;
    busy = true; spinButton.disabled = true; spinButton.innerHTML = 'Крутим… <span>↻</span>';
    panel.classList.add("spinning");
    const mode = modes[selected], prize = weightedInteger(mode.max);
    buildStrip(prize);
    caption.textContent = "РУЛЕТКА ВРАЩАЕТСЯ";
    message.textContent = "Секунду… определяем результат.";
    window.setTimeout(() => {
      resultValue.textContent = fmt(prize);
      caption.textContent = "ТВОЙ ВЫИГРЫШ";
      message.textContent = prize === mode.max ? "Максимальный приз! Отличная удача." : prize >= mode.max * .65 ? "Солидный выигрыш — поздравляем!" : prize >= mode.max * .3 ? "Неплохой результат. Можно попробовать ещё." : "Результат готов. Можно крутить снова.";
      costNote.textContent = `Режим: ${mode.label} · стоимость: ${mode.cost} баллов`;
      panel.classList.remove("spinning"); busy = false; spinButton.disabled = false; spinButton.innerHTML = 'Крутить рулетку <span>↻</span>';
    }, 4300);
  });
})();
