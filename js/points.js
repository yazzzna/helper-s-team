document.addEventListener("DOMContentLoaded", () => {
  const config = {
    normal: {
      name: "Обычная рулетка",
      cost: 35,
      max: 65,
      description: "Для тех, кто не любит рисковать.",
      decay: 0.025
    },
    super: {
      name: "Супер-рулетка",
      cost: 45,
      max: 90,
      description: "Для тех, кто хочет испытать удачу.",
      decay: 0.018
    },
    mega: {
      name: "Мега-рулетка",
      cost: 55,
      max: 150,
      description: "Для самых активных и азартных.",
      decay: 0.012
    }
  };

  let selected = "normal";

  const cards = [
    ...document.querySelectorAll("#pointTypes [data-type]")
  ];

  const value = document.getElementById("pointsValue");
  const stage = document.querySelector(".number-stage");
  const button = document.getElementById("spinPoints");
  const ticker = document.getElementById("pointsTicker");
  const status = document.getElementById("pointsStatus");

  function selectType(type) {
    selected = type;

    const item = config[type];

    cards.forEach(card => {
      const active = card.dataset.type === type;

      card.classList.toggle("selected", active);
      card.setAttribute("aria-pressed", String(active));
    });

    document.getElementById("pointsCost").textContent =
      `${item.cost} баллов`;

    document.getElementById("pointsRange").textContent =
      `0–${item.max} баллов`;

    status.textContent =
      `${item.name}: стоимость ${item.cost} баллов, ` +
      `выигрыш от 0 до ${item.max}.`;
  }

  cards.forEach(card => {
    card.addEventListener("click", () => {
      if (!button.disabled) {
        selectType(card.dataset.type);
      }
    });
  });

  button.addEventListener("click", () => {
    const item = config[selected];

    HelperRoulette.runNumberSpin({
      button,
      stage,
      valueNode: value,
      ticker,
      status,
      duration: 2800,

      choose: () =>
        HelperRoulette.weightedInteger(
          0,
          item.max,
          item.decay
        ),

      format: n => HelperRoulette.formatNumber(n),

      onDone: n => {
        status.textContent =
          `Выпало ${HelperRoulette.formatNumber(n)} баллов. ` +
          `Стоимость запуска (${item.cost}) указана отдельно.`;

        value.classList.remove("confetti");
        void value.offsetWidth;
        value.classList.add("confetti");
      }
    });
  });

  selectType(selected);
});
