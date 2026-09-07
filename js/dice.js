/**
 * dice.js
 * 게임판 가운데에 "차례 + 주사위" 카드를 띄운다.
 *  - 사람 차례: 카드를 눌러 주사위를 굴린다
 *  - AI 차례: 카드만 보여주고, AI 드라이버가 rollDiceInCenter를 호출한다
 * 주사위는 카드 안에서 굴러가고, 나온 숫자를 크게 "쾅" 보여준 뒤 이동한다.
 */

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function rollDiceValue() {
  return Math.floor(Math.random() * 6) + 1;
}

/** 차례 카드를 띄운다. onRoll: 사람이 카드를 눌렀을 때 실행 (없으면 = AI 차례, 안 눌림) */
function showTurnPrompt(player, onRoll) {
  const stage = document.getElementById("dice-stage");
  const turn = document.getElementById("dice-stage-turn");
  const die = document.getElementById("dice-stage-die");
  const num = document.getElementById("dice-stage-num");
  const hint = document.getElementById("dice-stage-hint");
  const btn = document.getElementById("dice-stage-btn");
  if (!stage) return;

  const piece = window.pieceMarkup ? window.pieceMarkup(window.playerPiece(player), "lg") : "";
  turn.innerHTML = `${piece}<span class="ds-name">${player.name}${player.isAI ? " 🤖" : ""}의 차례!</span>`;
  die.textContent = "🎲";
  die.hidden = false;
  die.classList.remove("rolling");
  num.textContent = "";
  num.classList.remove("show");

  stage.classList.remove("hidden", "is-rolling");
  stage.classList.add("is-open", "is-prompt");
  void stage.offsetWidth;

  if (player.isAI) {
    hint.textContent = "AI가 생각 중이에요…";
    btn.classList.add("is-ai");
    btn.onclick = null;
  } else {
    hint.textContent = "여기를 눌러 주사위를 굴려요!";
    btn.classList.remove("is-ai");
    btn.onclick = () => {
      if (stage.classList.contains("is-rolling")) return;
      onRoll && onRoll();
    };
  }
}

function hideTurnPrompt() {
  const stage = document.getElementById("dice-stage");
  if (stage) stage.classList.add("hidden");
}

/** 차례 카드 안에서 주사위를 굴리고, 결과를 onFinish(value)로 넘긴다 */
function rollDiceInCenter(onFinish) {
  const stage = document.getElementById("dice-stage");
  const die = document.getElementById("dice-stage-die");
  const num = document.getElementById("dice-stage-num");
  const hint = document.getElementById("dice-stage-hint");
  const finalValue = rollDiceValue();

  if (window.playSound) window.playSound("dice");

  const done = () => {
    stage.classList.add("hidden");
    stage.classList.remove("is-open", "is-prompt", "is-rolling");
    num.classList.remove("show");
    die.classList.remove("rolling");
    onFinish(finalValue);
  };

  stage.classList.remove("hidden", "is-prompt");
  stage.classList.add("is-open", "is-rolling");
  if (hint) hint.textContent = "";
  num.textContent = "";
  num.classList.remove("show");
  die.textContent = "🎲";
  die.hidden = false;
  void stage.offsetWidth;

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

window.rollDiceValue = rollDiceValue;
window.rollDiceInCenter = rollDiceInCenter;
window.showTurnPrompt = showTurnPrompt;
window.hideTurnPrompt = hideTurnPrompt;
