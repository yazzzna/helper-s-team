(() => {
  const prizes = [
    "Бесплатный неактив на 3 дня",
    "Игровая валюта в размере 250 000 ИВ",
    "Роспись от руководства сервера TULA",
    "Роспись от КАП и ЗКАП",
    "Отгул нормы на 1 день",
    "Сгорание всех баллов"
  ];
  const wheel = document.getElementById("giftWheel");
  const spin = document.getElementById("giftSpin");
  const caption = document.getElementById("giftCaption");
  const result = document.getElementById("giftResult");
  const message = document.getElementById("giftMessage");
  const modal = document.getElementById("giftModal");
  const modalPrize = document.getElementById("modalPrize");
  const closeModal = document.getElementById("closeModal");
  let busy = false, rotation = 0;

  // Каждый индекс выбирается одинаково: Math.random() равномерно выбирает число 0–5.
  // Указатель находится сверху. Сектора ориентированы от -30 градусов; центр сектора i
  // находится под указателем при угле поворота -(i * 60) градусов modulo 360.
  spin.addEventListener("click", () => {
    if (busy) return;
    busy = true; spin.disabled = true; spin.innerHTML = 'Колесо вращается… <span>↻</span>';
    caption.textContent = "КОЛЕСО ВРАЩАЕТСЯ"; result.textContent = "Удача уже рядом";
    message.textContent = "Не торопись — колесо замедляется.";
    const index = Math.floor(Math.random() * prizes.length);
    const current = ((rotation % 360) + 360) % 360;
    const desired = ((360 - index * 60) % 360);
    const extra = (desired - current + 360) % 360;
    rotation += 360 * 6 + extra;
    wheel.style.transform = `rotate(${rotation}deg)`;
    window.setTimeout(() => {
      caption.textContent = "ТВОЙ РЕЗУЛЬТАТ";
      result.textContent = prizes[index];
      message.textContent = "Все шесть вариантов имеют одинаковую вероятность — 16,67%.";
      modalPrize.textContent = prizes[index];
      modal.hidden = false;
      busy = false; spin.disabled = false; spin.innerHTML = 'Крутить колесо <span>↻</span>';
    }, 5650);
  });
  closeModal.addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", event => { if (event.target === modal) modal.hidden = true; });
  document.addEventListener("keydown", event => { if (event.key === "Escape") modal.hidden = true; });
})();
