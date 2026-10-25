document.addEventListener("DOMContentLoaded", () => {
  const config = {
    small: { name:"Малая рулетка ИВ", cost:45, min:100, max:10000, decay:.00065 },
    medium: { name:"Средняя рулетка ИВ", cost:55, min:1000, max:100000, decay:.000055 },
    large: { name:"Большая рулетка ИВ", cost:65, min:100000, max:500000, decay:.000018 }
  };
  const STORAGE_KEY = "helperTulaCurrencySpinsUsed_v1";
  const getUsed = () => { try { const n = Number(localStorage.getItem(STORAGE_KEY)); return Number.isInteger(n) && n >= 0 ? Math.min(n,2) : 0; } catch { return 0; } };
  const setUsed = n => { try { localStorage.setItem(STORAGE_KEY, String(n)); } catch { /* Browser storage may be disabled; current-page limit still works. */ } };
  let used = getUsed(), selected = "small";
  const cards = [...document.querySelectorAll("#currencyTypes [data-type]")];
  const value = document.getElementById("currencyValue"), stage = document.querySelector(".number-stage");
  const button = document.getElementById("spinCurrency"), ticker = document.getElementById("currencyTicker"), status = document.getElementById("currencyStatus");
  function updateCounter() {
    const remaining = Math.max(0, 2-used);
    document.getElementById("currencyRemaining").textContent = remaining;
    document.getElementById("currencyUses").textContent = `ОСТАЛОСЬ: ${remaining} ИЗ 2`;
    button.disabled = remaining === 0;
    if (remaining === 0) status.textContent = "Все попытки использованы.";
  }
  function selectType(type) {
    selected = type; const item = config[type];
    cards.forEach(card => { const active = card.dataset.type === type; card.classList.toggle("selected", active); card.setAttribute("aria-pressed", String(active)); });
    document.getElementById("currencyCost").textContent = `${item.cost} баллов`;
    document.getElementById("currencyRange").textContent = `${HelperRoulette.formatNumber(item.min)}–${HelperRoulette.formatNumber(item.max)} ИВ`;
    if (used < 2) status.textContent = `${item.name}: стоимость ${item.cost} баллов. Осталось попыток: ${2-used}.`;
  }
  cards.forEach(card => card.addEventListener("click", () => { if (!button.disabled) selectType(card.dataset.type); }));
  button.addEventListener("click", () => {
    if (used >= 2 || button.disabled) return;
    // Consume the attempt immediately, so refreshing or double-clicking cannot reuse it.
    used += 1; setUsed(used); updateCounter();
    const item = config[selected];
    HelperRoulette.runNumberSpin({button, stage, valueNode:value, ticker, status, duration:3000,
      choose:() => HelperRoulette.weightedInteger(item.min, item.max, item.decay),
      format:n => HelperRoulette.formatNumber(n),
      onDone:n => { status.textContent = `Выпало ${HelperRoulette.formatNumber(n)} ИВ. Использовано попыток: ${used} из 2.`; value.classList.remove("confetti"); void value.offsetWidth; value.classList.add("confetti"); updateCounter(); }
    });
  });
  selectType(selected); updateCounter();
});