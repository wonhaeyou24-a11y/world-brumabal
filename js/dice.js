/**
 * dice.js
 * 게임판 가운데에 "차례 + 3D 주사위" 카드를 띄운다.
 *  - 사람 차례: 카드를 눌러 주사위를 굴린다
 *  - AI 차례: 카드만 보여주고, AI 드라이버가 rollDiceInCenter를 호출한다
 *
 * 3D 입체 텀블링 애니메이션과 실시간 도트 플리커, 착지 슬램다운, 더블 골드 연출이 포함됩니다.
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

/**
 * 1~6 주사위 눈금(Pip) HTML을 생성한다.
 * 3x3 그리드 규격 (1과 5의 중앙 도트는 전통 브루마블 시그니처 크림슨 레드)
 */
function renderDicePipHTML(val) {
  const v = Math.min(6, Math.max(1, Number(val) || 1));
  let pips = "";
  if (v === 1) {
    pips = `<i class="pip pip-c red"></i>`;
  } else if (v === 2) {
    pips = `<i class="pip pip-tl"></i><i class="pip pip-br"></i>`;
  } else if (v === 3) {
    pips = `<i class="pip pip-tl"></i><i class="pip pip-c"></i><i class="pip pip-br"></i>`;
  } else if (v === 4) {
    pips = `<i class="pip pip-tl"></i><i class="pip pip-tr"></i><i class="pip pip-bl"></i><i class="pip pip-br"></i>`;
  } else if (v === 5) {
    pips = `<i class="pip pip-tl"></i><i class="pip pip-tr"></i><i class="pip pip-c red"></i><i class="pip pip-bl"></i><i class="pip pip-br"></i>`;
  } else if (v === 6) {
    pips = `<i class="pip pip-tl"></i><i class="pip pip-tr"></i><i class="pip pip-ml"></i><i class="pip pip-mr"></i><i class="pip pip-bl"></i><i class="pip pip-br"></i>`;
  }
  return `<span class="dice-face dice-face--${v}">${pips}</span>`;
}

function setDieFace(dieEl, val) {
  if (!dieEl) return;
  dieEl.innerHTML = renderDicePipHTML(val);
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

  // 초기 주사위 눈 설정 (1, 2)
  setDieFace(die, 1);
  setDieFace(die2, 2);
  die.className = "dice-stage-die";
  die2.className = "dice-stage-die";
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

/** 차례 카드 안에서 3D 주사위를 굴리고, 결과를 onFinish(value, roll)로 넘긴다 */
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
    die.className = "dice-stage-die";
    die2.className = "dice-stage-die";
    onFinish(roll.total, roll);
  };

  const showResult = () => {
    setDieFace(die, roll.d1);
    setDieFace(die2, roll.d2);
    die.className = "dice-stage-die slam-down" + (roll.isDouble ? " is-double" : "");
    die2.className = "dice-stage-die slam-down" + (roll.isDouble ? " is-double" : "");
    if (dice) dice.hidden = false;
    num.textContent = roll.total;
    num.classList.add("show");

    if (roll.isDouble) {
      if (hint) {
        hint.innerHTML = `<span class="ds-double-badge">🎉 더블!! [${roll.d1} + ${roll.d2}] 한 번 더!</span>`;
      }
      if (window.playSound) window.playSound("doubleFanfare");
    } else {
      if (hint) hint.textContent = `${roll.d1} + ${roll.d2} = ${roll.total}칸 이동!`;
      if (window.playSound) window.playSound("dice");
    }
  };

  stage.classList.remove("hidden", "is-prompt");
  stage.classList.add("is-open", "is-rolling");
  if (hint) hint.textContent = "";
  num.textContent = "";
  num.classList.remove("show");
  if (dice) dice.hidden = false;

  void stage.offsetWidth;

  const reduced = window.prefersReducedAnim && window.prefersReducedAnim();
  if (reduced) {
    showResult();
    setTimeout(done, 900);
    return;
  }

  // 3D 리얼 텀블링 롤링 애니메이션 시작
  die.className = "dice-stage-die tumble-1";
  die2.className = "dice-stage-die tumble-2";

  // 물리적 감속 주사위 눈 회전 (처음엔 빠르게 구르다가 점차 감속하며 자연스럽게 안착)
  const stepDelays = [65, 75, 90, 115, 150, 195, 260];
  let stepIndex = 0;

  const rollStep = () => {
    if (stepIndex < stepDelays.length) {
      setDieFace(die, Math.floor(Math.random() * 6) + 1);
      setDieFace(die2, Math.floor(Math.random() * 6) + 1);
      setTimeout(rollStep, stepDelays[stepIndex]);
      stepIndex++;
    } else {
      showResult();
      setTimeout(done, 1200);
    }
  };
  rollStep();
}

window.rollDiceValue = rollDiceValue;
window.rollTwoDice = rollTwoDice;
window.rollDiceInCenter = rollDiceInCenter;
window.showTurnPrompt = showTurnPrompt;
window.hideTurnPrompt = hideTurnPrompt;
window.renderDicePipHTML = renderDicePipHTML;
window.setDieFace = setDieFace;
