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

/** 주사위 두 개를 굴린 결과 */
function rollTwoDice() {
  const d1 = rollDiceValue();
  const d2 = rollDiceValue();
  return { d1, d2, total: d1 + d2, isDouble: d1 === d2 };
}

/** 차례 카드를 띄운다. onRoll: 사람이 카드를 눌렀을 때 실행 (없으면 = AI 차례, 안 눌림) */
function showTurnPrompt(player, onRoll) {
  const stage = document.getElementById("dice-stage");
  const turn = document.getElementById("dice-stage-turn");
  const dice = document.getElementById("dice-stage-dice");
  const die = document.getElementById("dice-stage-die");
  const die2 = document.getElementById("dice-stage-die-2");
  const num = document.getElementById("dice-stage-num");
  const hint = document.getElementById("dice-stage-hint");
  const btn = document.getElementById("dice-stage-btn");
  if (!stage) return;

  const piece = window.pieceMarkup ? window.pieceMarkup(window.playerPiece(player), "lg") : "";
  const gs = window.gameState;
  const turnTxt =
    gs && gs.maxTurns && gs.endMode !== "bankruptcy"
      ? `<span class="ds-turn-count">${gs.turn} / ${gs.maxTurns}턴</span>`
      : "";
  turn.innerHTML = `${piece}<span class="ds-name">${player.name}${player.isAI ? " 🤖" : ""}의 차례!</span>${turnTxt}`;
  if (dice) dice.hidden = false;
  die.textContent = "🎲";
  die2.textContent = "🎲";
  die.classList.remove("rolling");
  die2.classList.remove("rolling");
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
  const dice = document.getElementById("dice-stage-dice");
  const die = document.getElementById("dice-stage-die");
  const die2 = document.getElementById("dice-stage-die-2");
  const num = document.getElementById("dice-stage-num");
  const hint = document.getElementById("dice-stage-hint");
  const roll = rollTwoDice();

  if (window.playSound) window.playSound("diceRoll");

  const done = () => {
    stage.classList.add("hidden");
    stage.classList.remove("is-open", "is-prompt", "is-rolling");
    num.classList.remove("show");
    die.classList.remove("rolling");
    die2.classList.remove("rolling");
    onFinish(roll.total, roll);
  };

  const showResult = () => {
    die.classList.remove("rolling");
    die2.classList.remove("rolling");
    die.textContent = DICE_FACES[roll.d1 - 1];
    die2.textContent = DICE_FACES[roll.d2 - 1];
    if (dice) dice.hidden = true;
    num.textContent = roll.total;
    num.classList.add("show");
    if (hint) hint.textContent = `${roll.d1} + ${roll.d2}${roll.isDouble ? "  ·  더블! 🎉" : ""}`;
    if (window.playSound) window.playSound(roll.isDouble ? "keyReveal" : "dice");
  };

  stage.classList.remove("hidden", "is-prompt");
  stage.classList.add("is-open", "is-rolling");
  if (hint) hint.textContent = "";
  num.textContent = "";
  num.classList.remove("show");
  if (dice) dice.hidden = false;
  die.textContent = "🎲";
  die2.textContent = "🎲";
  void stage.offsetWidth;

  const reduced = window.prefersReducedAnim && window.prefersReducedAnim();
  if (reduced) {
    showResult();
    setTimeout(done, 900);
    return;
  }

  die.classList.add("rolling");
  die2.classList.add("rolling");
  setTimeout(() => {
    showResult();
    setTimeout(done, 1100);
  }, 900);
}

window.rollDiceValue = rollDiceValue;
window.rollTwoDice = rollTwoDice;
window.rollDiceInCenter = rollDiceInCenter;
window.showTurnPrompt = showTurnPrompt;
window.hideTurnPrompt = hideTurnPrompt;
