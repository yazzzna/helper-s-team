document.addEventListener("DOMContentLoaded", () => {
  const prizes = [
    "Бесплатный неактив на 3 дня",
    "Игровая валюта — 250 000 ИВ",
    "Роспись от руководства сервера TULA",
    "Роспись от КАП и ЗКАП",
    "Отгул нормы на 1 день",
    "Сгорание всех баллов"
  ];
  // Sector 0 is centered at the top; sectors proceed clockwise.
  const colors = ["#00ffff", "#ff4500", "#273b4b", "#b7a2ff", "#e4e8ee", "#1c2a36"];
  const wheel = document.getElementById("giftWheel"), button = document.getElementById("spinGifts");
  const status = document.getElementById("giftStatus"), result = document.getElementById("giftResult");
  const list = document.getElementById("prizeList"), modal = document.getElementById("giftModal");
  const modalPrize = document.getElementById("modalPrize");
  // SVG text is positioned in each wedge so prize names remain readable on desktop and mobile.
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns,"svg");
  svg.setAttribute("viewBox","0 0 400 400"); svg.setAttribute("class","wheel-labels"); svg.setAttribute("aria-hidden","true");
  function polar(r, angle) { const rad = angle * Math.PI / 180; return [200 + r*Math.sin(rad), 200 - r*Math.cos(rad)]; }
  prizes.forEach((prize, i) => {
    const [x,y] = polar(125, i*60);
    const text = document.createElementNS(ns,"text"); text.setAttribute("x",x); text.setAttribute("y",y);
    text.setAttribute("transform",`rotate(${i*60},${x},${y})`); text.setAttribute("text-anchor","middle");
    text.setAttribute("dominant-baseline","middle"); text.setAttribute("class","wheel-label");
    const words = prize.split(" "); const lines=[]; let line="";
    words.forEach(word => { if ((line+" "+word).trim().length > 15) { lines.push(line); line=word; } else line=(line+" "+word).trim(); }); if(line) lines.push(line);
    lines.slice(0,4).forEach((ln,j) => { const tspan=document.createElementNS(ns,"tspan"); tspan.setAttribute("x",x); tspan.setAttribute("dy",j===0?`${-(Math.min(lines.length,4)-1)*7}px`:"14px"); tspan.textContent=ln; text.appendChild(tspan); });
    svg.appendChild(text);
    const li=document.createElement("li"); li.textContent=prize; list.appendChild(li);
  });
  wheel.appendChild(svg);
  let rotation = 0, spinning = false;
  button.addEventListener("click", () => {
    if (spinning) return; spinning = true; button.disabled = true;
    status.textContent = "Колесо вращается…"; result.querySelector("strong").textContent = "УДАЧА В ДВИЖЕНИИ";
    const index = Math.floor(Math.random() * prizes.length); // Uniform 1/6 selection.
    const sectorCenter = index * 60;
    const current = ((rotation % 360) + 360) % 360;
    const targetMod = (360 - sectorCenter + 360) % 360; // Pointer is fixed at 12 o'clock.
    const delta = (targetMod - current + 360) % 360;
    rotation += 360 * 6 + delta;
    wheel.style.transform = `rotate(${rotation}deg)`;
    const finish = () => {
      wheel.removeEventListener("transitionend", finish);
      spinning = false; button.disabled = false;
      result.querySelector("strong").textContent = prizes[index];
      result.querySelector("p").textContent = "Сектор выбран случайно. Вероятность каждого приза — 1/6.";
      result.classList.remove("confetti"); void result.offsetWidth; result.classList.add("confetti");
      status.textContent = `Выпал сектор ${index+1} из 6.`;
      modalPrize.textContent = prizes[index];
      if (typeof modal.showModal === "function") modal.showModal();
      else alert(`Твой приз: ${prizes[index]}`);
    };
    wheel.addEventListener("transitionend", finish);
    // Fallback prevents a stuck UI if transitionend is suppressed by reduced motion/browser quirks.
    window.setTimeout(() => { if (spinning) finish(); }, 5400);
  });
  document.getElementById("closeGiftModal").addEventListener("click", () => modal.close());
  document.getElementById("modalAgain").addEventListener("click", () => modal.close());
});