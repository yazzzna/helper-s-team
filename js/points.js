(() => {
  const modes = {
    normal: { cost: 35, min: 0, max: 65, label: "Обычная рулетка" },
    super:  { cost: 45, min: 0, max: 90, label: "Супер-рулетка" },
    mega:   { cost: 55, min: 0, max: 150, label: "Мега-рулетка" }
  };

  let selected = "normal";
  let busy = false;

  const buttons = [...document.querySelectorAll("[data-mode]")];
  const spinButton = document.getElementById("spinButton");
  const track = document.getElementById("slotTrack");
  const resultValue = document.getElementById("resultValue");
  const caption = document.getElementById("resultCaption");
  const message = document.getElementById("resultMessage");
  const costNote = document.getElementById("costNote");
  const panel = document.querySelector(".spin-panel");

  const formatNumber = value => value.toLocaleString("ru-RU");

  /*
   * Взвешенное распределение.
   * Для каждого целого значения от min до max рассчитывается положительный вес.
   * Чем выше доля выигрыша в диапазоне, тем ниже вес, но он никогда не равен нулю.
   *
   * Параметр exponent управляет резкостью снижения:
   * меньше 1.7 — распределение ровнее и крупные призы чаще;
   * больше 1.7 — чаще выпадают небольшие призы.
   *
   * Параметр scale задаёт, насколько быстро снижается вероятность.
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
    message.textContent = `Выигрыш: от ${mode.min} до ${mode.max} баллов.`;

    track.querySelectorAll(".winner").forEach(item => item.classList.remove("winner"));
  }

  function buildAndSpinStrip(prize, mode) {
    track.innerHTML = "";

    const values = [];
    const fillerCount = 28;

    // Декоративные значения ленты не влияют на приз.
    for (let index = 0; index < fillerCount; index++) {
      values.push(Math.floor(Math.random() * (mode.max - mode.min + 1)) + mode.min);
    }

    // Фактический выигрыш располагается в известной позиции и подводится к указателю.
    values.push(prize);

    for (let index = 0; index < 5; index++) {
      values.push(Math.floor(Math.random() * (mode.max - mode.min + 1)) + mode.min);
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

      if (prize === mode.max) {
        message.textContent = "Максимальный приз! Отличная удача.";
      } else if (prize >= mode.max * 0.65) {
        message.textContent = "Солидный выигрыш — поздравляем!";
      } else if (prize >= mode.max * 0.3) {
        message.textContent = "Неплохой результат. Можно попробовать ещё.";
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

  // Отображаем правильную стоимость и диапазон при первоначальной загрузке.
  setSelectedMode("normal");
})();
