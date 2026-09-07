/**
 * dice.js
 * 주사위 굴리기 로직과 간단한 애니메이션 시퀀스를 담당한다.
 */

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function rollDiceValue() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * 주사위 굴리기 애니메이션을 실행하고 최종 값을 콜백으로 전달한다.
 * diceEl: 주사위 숫자를 표시할 DOM 엘리먼트
 * onFinish(finalValue): 애니메이션 종료 후 호출
 */
function playDiceAnimation(diceEl, onFinish) {
  let ticks = 0;
  const maxTicks = 10;
  const shakeTarget = diceEl.closest(".dice-btn") || diceEl;
  shakeTarget.classList.add("dice--rolling");

  const interval = setInterval(() => {
    const randomFace = DICE_FACES[Math.floor(Math.random() * 6)];
    diceEl.textContent = randomFace;
    ticks++;
    if (ticks >= maxTicks) {
      clearInterval(interval);
      const finalValue = rollDiceValue();
      diceEl.textContent = DICE_FACES[finalValue - 1];
      shakeTarget.classList.remove("dice--rolling");
      onFinish(finalValue);
    }
  }, 80);
}

window.rollDiceValue = rollDiceValue;
window.playDiceAnimation = playDiceAnimation;
