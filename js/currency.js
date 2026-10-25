(() => {
  const modes = {
    small:  { cost: 45, min: 100,    max: 10000,  label: "Малая рулетка ИВ" },
    medium: { cost: 55, min: 1000,   max: 100000, label: "Средняя рулетка ИВ" },
    large:  { cost: 65, min: 100000, max: 500000, label: "Большая рулетка ИВ" }
  };

  let selected = "small";
  let busy = false;

  const buttons = [...document.querySelectorAll("[data-mode]")];
  const spinButton = document.getElementById("spinButton");
  const track = document.getElementById("slotTrack");
  const resultValue = document.getElementById("resultValue");
  const caption = document.getElementById("resultCaption");
  const message = document.getElementById("resultMessage");
  const costNote = document.getElementById("costNote");
  const panel = document.querySelector(".spin-panel");

  const formatNumber = value => Math.round(value).toLocaleString("ru-RU");

  /*
   * Взвешенное распределение: все целые суммы в диапазоне имеют положительный вес.
   * По мере роста суммы вес плавно уменьшается, поэтому небольшие выигрыши чаще.
   *
   * exponent уменьшайте, чтобы крупные призы выпадали чаще.
   * scale увеличивайте, чтобы вероятность снижалась медленнее.
   */
  const WEIGHT_CONFIG = {
    exponent: 1.7,
    scale: 0.58
  };

  function getPrizeWeight(value, min, max) {
    const range = max - min;
    if (range === 0) return 1;

    const fraction = (value - min) / range;
    return 1 / (1 + Math.pow(fraction / WEIGHT_CONFIG.scale, WEIGHT_CONFIG.exponent));
  }

  function randomWeightedInteger(min, max) {
    const weights = [];
    let totalWeight = 0;

    for (let value = min; value <= max; value++) {
      const weight = getPrizeWeight(value, min, max);
      weights.push(weight);
      totalWeight += weight;
    }

    let randomValue = Math.random() * totalWeight;

    for (let index = 0; index < weights.length; index++) {
      randomValue -= weights[index];
      if (randomValue < 0) {
        return min + index;
      }
    }

    return max;
  }

  function setSelectedMode(modeKey) {
    if (busy || !modes[modeKey]) return;

    selected = modeKey;
    const mode = modes[selected];

    buttons.forEach(button => {
      button.classList.toggle("active", button.dataset.mode === selected);
    });

    costNote.textContent = `Стоимость прокрутки: ${mode.cost} баллов`;
    resultValue.textContent = "—";
    caption.textContent = "ГОТОВ К ЗАПУСКУ";
    message.textContent = `Выигрыш: от ${formatNumber(mode.min)} до ${formatNumber(mode.max)} ИВ.`;

    track.querySelectorAll(".winner").forEach(item => item.classList.remove("winner"));
  }

  function buildAndSpinStrip(prize, mode) {
    track.innerHTML = "";

    const values = [];
    const fillerCount = 28;

    // Декоративные значения нужны только для анимации и не определяют выигрыш.
    for (let index = 0; index < fillerCount; index++) {
      values.push(randomWeightedInteger(mode.min, mode.max));
    }

    // Приз, заранее выбранный рандомайзером, будет точно под указателем.
    values.push(prize);

    for (let index = 0; index < 5; index++) {
      values.push(randomWeightedInteger(mode.min, mode.max));
    }

    values.forEach((value, index) => {
      const item = document.createElement("span");
      item.textContent = formatNumber(value);
      if (index === fillerCount) item.classList.add("winner");
      track.appendChild(item);
    });

    track.style.transition = "none";
    track.style.transform = "translateX(0px)";
    void track.offsetWidth;

    const target = track.children[fillerCount];
    const frame = track.parentElement;
    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    const offset = targetCenter - frame.clientWidth / 2;

    track.style.transition = "transform 4.2s cubic-bezier(.08,.72,.12,1)";
    track.style.transform = `translateX(${-offset}px)`;
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => setSelectedMode(button.dataset.mode));
  });

  spinButton.addEventListener("click", () => {
    if (busy) return;

    busy = true;
    spinButton.disabled = true;
    spinButton.innerHTML = 'Крутим… <span>↻</span>';
    panel.classList.add("spinning");

    const mode = modes[selected];
    const prize = randomWeightedInteger(mode.min, mode.max);

    caption.textContent = "РУЛЕТКА ВРАЩАЕТСЯ";
    message.textContent = "Определяем результат…";
    buildAndSpinStrip(prize, mode);

    window.setTimeout(() => {
      resultValue.textContent = formatNumber(prize);
      caption.textContent = "ТВОЙ ВЫИГРЫШ";

      const ratio = (prize - mode.min) / (mode.max - mode.min);
      if (ratio > 0.75) {
        message.textContent = "Крупный приз! Вот это удача.";
      } else if (ratio > 0.4) {
        message.textContent = "Отличный результат — поздравляем!";
      } else {
        message.textContent = "Результат готов. Можно крутить снова.";
      }

      costNote.textContent = `Режим: ${mode.label} · стоимость прокрутки: ${mode.cost} баллов`;
      panel.classList.remove("spinning");
      busy = false;
      spinButton.disabled = false;
      spinButton.innerHTML = 'Крутить рулетку <span>↻</span>';
    }, 4300);
  });

  // При загрузке показываем стоимость и диапазон малой рулетки.
  setSelectedMode("small");
})();
