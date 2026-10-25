(() => {
  const modes = {
    small: { cost: 45, min: 100, max: 10000, label: "Малая рулетка ИВ" },
    medium: { cost: 55, min: 1000, max: 100000, label: "Средняя рулетка ИВ" },
    large: { cost: 65, min: 100000, max: 500000, label: "Большая рулетка ИВ" }
  };
  let selected = "small", busy = false;
  const buttons = [...document.querySelectorAll("[data-mode]")];
  const spinButton = document.getElementById("spinButton");
  const track = document.getElementById("slotTrack");
  const resultValue = document.getElementById("resultValue");
  const caption = document.getElementById("resultCaption");
  const message = document.getElementById("resultMessage");
  const costNote = document.getElementById("costNote");
  const panel = document.querySelector(".spin-panel");
  const fmt = n => Math.round(n).toLocaleString("ru-RU");

  // Вес = 1 / (1 + (доля диапазона / 0.58)^1.7).
  // Каждая целая сумма имеет ненулевой шанс, большие суммы реже, но достижимы.
  function weightedInteger(min, max) {
    const range = max - min, weights = new Float64Array(range + 1);
    let total = 0;
    for (let i = 0; i <= range; i++) {
      const fraction = i / range;
      weights[i] = 1 / (1 + Math.pow(fraction / 0.58, 1.7));
      total += weights[i];
    }
    let pick = Math.random() * total;
    for (let i = 0; i <= range; i++) { pick -= weights[i]; if (pick <= 0) return min + i; }
    return max;
  }
  buttons.forEach(button => button.addEventListener("click", () => {
    if (busy) return;
    selected = button.dataset.mode;
    buttons.forEach(b => b.classList.toggle("active", b === button));
    const mode = modes[selected];
    costNote.textContent = `Стоимость прокрутки: ${mode.cost} баллов`;
    resultValue.textContent = "—"; caption.textContent = "ГОТОВ К ЗАПУСКУ";
    message.textContent = `Диапазон выигрыша: ${fmt(mode.min)}–${fmt(mode.max)} ИВ.`;
    track.querySelectorAll(".winner").forEach(el => el.classList.remove("winner"));
  }));
  function buildStrip(finalValue) {
    const mode = modes[selected]; track.innerHTML = "";
    const values = [];
    for (let i = 0; i < 28; i++) values.push(weightedInteger(mode.min, mode.max));
    values.push(finalValue);
    for (let i = 0; i < 5; i++) values.push(weightedInteger(mode.min, mode.max));
    values.forEach((value, index) => {
      const span = document.createElement("span"); span.textContent = fmt(value);
      if (index === 28) span.classList.add("winner");
      track.appendChild(span);
    });
    track.style.transition = "none"; track.style.transform = "translateX(0px)"; void track.offsetWidth;
    const target = track.children[28], frame = track.parentElement;
    const offset = target.offsetLeft + target.offsetWidth / 2 - frame.clientWidth / 2;
    track.style.transition = "transform 4.2s cubic-bezier(.08,.72,.12,1)";
    track.style.transform = `translateX(${-offset}px)`;
  }
  spinButton.addEventListener("click", () => {
    if (busy) return;
    busy = true; spinButton.disabled = true; spinButton.innerHTML = 'Крутим… <span>↻</span>';
    panel.classList.add("spinning");
    const mode = modes[selected], prize = weightedInteger(mode.min, mode.max);
    buildStrip(prize); caption.textContent = "РУЛЕТКА ВРАЩАЕТСЯ"; message.textContent = "Секунду… определяем результат.";
    window.setTimeout(() => {
      resultValue.textContent = fmt(prize); caption.textContent = "ТВОЙ ВЫИГРЫШ";
      const ratio = (prize - mode.min) / (mode.max - mode.min);
      message.textContent = ratio > .75 ? "Крупный приз! Вот это удача." : ratio > .4 ? "Отличный результат — поздравляем!" : "Результат готов. Можно крутить снова.";
      costNote.textContent = `Режим: ${mode.label} · стоимость: ${mode.cost} баллов`;
      panel.classList.remove("spinning"); busy = false; spinButton.disabled = false; spinButton.innerHTML = 'Крутить рулетку <span>↻</span>';
    }, 4300);
  });
})();
