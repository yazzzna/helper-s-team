(() => {
  "use strict";

  const configs = {
    small: {
      name: "Малая рулетка ИВ",
      cost: 45,
      min: 100,
      max: 10000,
      decay: 0.00018
    },
    medium: {
      name: "Средняя рулетка ИВ",
      cost: 55,
      min: 1000,
      max: 100000,
      decay: 0.000008
    },
    large: {
      name: "Большая рулетка ИВ",
      cost: 65,
      min: 100000,
      max: 500000,
      decay: 0.000003
    }
  };

  const $ = (selector) => document.querySelector(selector);

  const valueElement = $("#currencyValue");
  const titleElement = $("#currencyRange");
  const costElement = $("#currencyCost");
  const rangeElement = $("#currencyRangeInfo");
  const statusElement = $("#currencyStatus");
  const spinButton = $("#spinCurrency");
  const tickerElement = $("#currencyTicker");
  const typeButtons = document.querySelectorAll(
    "#currencyTypes [data-type]"
  );

  if (
    !valueElement ||
    !titleElement ||
    !costElement ||
    !rangeElement ||
    !statusElement ||
    !spinButton
  ) {
    console.error("Рулетка ИВ: не найдены необходимые HTML-элементы.");
    return;
  }

  let selectedType = "small";
  let isSpinning = false;

  const formatNumber = (number) =>
    Math.round(number).toLocaleString("ru-RU");

  function updateInterface() {
    const config = configs[selectedType];

    titleElement.textContent = config.name;
    costElement.textContent = `${config.cost} баллов`;
    rangeElement.textContent =
      `${formatNumber(config.min)}–${formatNumber(config.max)} ИВ`;

    typeButtons.forEach((button) => {
      const active = button.dataset.type === selectedType;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  // Чем меньше decay, тем выше шанс получить крупное значение.
  // Используем распределение с уклоном к большим выигрышам.
  function getRandomPrize(config) {
    const random = Math.random();
    const exponent = Math.max(0.35, Math.min(1, config.decay * 10000));

    const normalized = Math.pow(random, exponent);

    return Math.floor(
      config.min + normalized * (config.max - config.min)
    );
  }

  function setTickerAnimation(active) {
    if (!tickerElement) return;

    tickerElement.classList.toggle("is-spinning", active);
  }

  function spin() {
    // Ограничиваем только одновременные запуски анимации.
    // Количество попыток не ограничено.
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;
    spinButton.setAttribute("aria-busy", "true");

    statusElement.textContent = "Рулетка вращается...";
    setTickerAnimation(true);

    const config = configs[selectedType];
    const prize = getRandomPrize(config);
    const duration = 1600;
    const startedAt = Date.now();

    const animation = window.setInterval(() => {
      const randomPreview = Math.floor(
        config.min + Math.random() * (config.max - config.min)
      );

      valueElement.textContent = formatNumber(randomPreview);

      if (Date.now() - startedAt >= duration) {
        window.clearInterval(animation);

        valueElement.textContent = formatNumber(prize);
        statusElement.textContent =
          `Твой результат: ${formatNumber(prize)} ИВ!`;

        isSpinning = false;
        spinButton.disabled = false;
        spinButton.removeAttribute("aria-busy");
        setTickerAnimation(false);
      }
    }, 65);
  }

  typeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (isSpinning) return;

      const type = button.dataset.type;

      if (!Object.prototype.hasOwnProperty.call(configs, type)) {
        return;
      }

      selectedType = type;
      valueElement.textContent = "?";
      statusElement.textContent =
        "Режим выбран. Можешь крутить рулетку!";
      updateInterface();
    });
  });

  spinButton.addEventListener("click", spin);

  updateInterface();
})();
