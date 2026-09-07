/**
 * dice.js
 * 주사위 굴리기 로직 + 게임판 가운데에서 굴러가는 연출.
 */

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function rollDiceValue() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * 게임판 가운데 무대(#dice-stage)에서 주사위를 굴리고,
 * 나온 숫자를 크게 "쾅" 보여준 뒤 onFinish(value)를 호출한다.
 */
function rollDiceInCenter(onFinish) {
  const stage = document.getElementById("dice-stage");
  const die = document.getElementById("dice-stage-die");
  const num = document.getElementById("dice-stage-num");
  const sideFace = document.getElementById("dice-face");
  const finalValue = rollDiceValue();

  if (window.playSound) window.playSound("dice");

  const done = () => {
    stage.classList.add("hidden");
    stage.classList.remove("is-open");
    num.classList.remove("show");
    die.classList.remove("rolling");
    if (sideFace) sideFace.textContent = DICE_FACES[finalValue - 1];
    onFinish(finalValue);
  };

  num.textContent = "";
  num.classList.remove("show");
  stage.classList.remove("hidden");
  // 리플로우 후 등장 애니메이션
  void stage.offsetWidth;
  stage.classList.add("is-open");

  die.textContent = "🎲";
  die.hidden = false;

  const reduced = window.prefersReducedAnim && window.prefersReducedAnim();
  if (reduced) {
    die.hidden = true;
    num.textContent = finalValue;
    num.classList.add("show");
    setTimeout(done, 800);
    return;
  }

  die.classList.add("rolling");
  setTimeout(() => {
    die.classList.remove("rolling");
    die.hidden = true;
    num.textContent = finalValue;
    num.classList.add("show");
    if (window.playSound) window.playSound("land");
    setTimeout(done, 1050);
  }, 900);
}

/* 하위 호환용(예전 사이드 주사위 애니메이션) — 현재는 rollDiceInCenter 사용 */
function playDiceAnimation(diceEl, onFinish) {
  const v = rollDiceValue();
  if (diceEl) diceEl.textContent = DICE_FACES[v - 1];
  setTimeout(() => onFinish(v), 200);
}

window.rollDiceValue = rollDiceValue;
window.rollDiceInCenter = rollDiceInCenter;
window.playDiceAnimation = playDiceAnimation;
