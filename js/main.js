/**
 * main.js
 * 앱 진입점. 화면 전환과 턴 진행 흐름을 연결한다.
 * 실제 계산은 game.js / property.js / dice.js / quiz.js / event.js에 위임하고,
 * 화면 표시는 ui.js에 위임한다.
 */

window.gameState = null;
let selectedPlayerCount = 2;
let collectionReturnScreen = "screen-start"; // 도감에서 "뒤로" 눌렀을 때 돌아갈 화면

document.addEventListener("DOMContentLoaded", () => {
  bindStartScreen();
  bindSetupScreen();
  bindGameScreen();
  bindCollectionScreen();
  bindResultScreen();
});

/* ---------------------------------------------------------
   시작 화면
--------------------------------------------------------- */
function bindStartScreen() {
  const continueBtn = document.getElementById("btn-continue");
  continueBtn.disabled = !hasSavedGame();

  document.getElementById("btn-new-game").addEventListener("click", () => {
    selectedPlayerCount = 2;
    document.querySelectorAll(".count-chip").forEach((chip) => {
      chip.classList.toggle("active", Number(chip.dataset.count) === selectedPlayerCount);
    });
    renderSetupForm(selectedPlayerCount);
    showScreen("screen-setup");
  });

  continueBtn.addEventListener("click", () => {
    const saved = loadGame();
    if (!saved) return;
    window.gameState = saved;
    buildBoardDOMOnce();
    renderGameScreen(window.gameState);
    showScreen("screen-game");
  });

  document.getElementById("btn-collection").addEventListener("click", () => {
    collectionReturnScreen = "screen-start";
    renderCollectionScreen(null);
    showScreen("screen-collection");
  });

  document.getElementById("btn-how-to-play").addEventListener("click", () => {
    showModal(`
      <h3 class="modal-title">🎲 게임 방법</h3>
      <p class="modal-message" style="text-align:left;font-size:0.95rem;line-height:1.7">
        1. 순서대로 주사위를 굴려 말을 이동해요.<br>
        2. 도착한 나라가 비어 있으면 살 수 있어요.<br>
        &nbsp;&nbsp;&nbsp;수도 퀴즈를 맞히면 <b>20% 싸게</b> 살 수 있어요!<br>
        3. 다른 사람의 나라에 도착하면 통행료를 내요.<br>
        4. <b>❓ 찬스 칸</b>에서는 보너스·퀴즈·여행이 기다려요.<br>
        5. 방문한 나라는 <b>🧳 여행 도감</b>에 모여요.<br>
        6. 정해진 턴이 끝나면 총 자산이 가장 많은 사람이 우승!
      </p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="close-modal">확인했어요</button>
      </div>
    `);
  });
}

/* ---------------------------------------------------------
   설정 화면
--------------------------------------------------------- */
function bindSetupScreen() {
  document.querySelectorAll(".count-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedPlayerCount = Number(chip.dataset.count);
      document.querySelectorAll(".count-chip").forEach((c) => c.classList.toggle("active", c === chip));
      renderSetupForm(selectedPlayerCount);
    });
  });

  document.getElementById("btn-back-to-start").addEventListener("click", () => {
    showScreen("screen-start");
  });

  document.getElementById("btn-start-playing").addEventListener("click", () => {
    const configs = readSetupPlayerConfigs();
    window.gameState = createInitialGameState(configs);
    buildBoardDOMOnce();
    renderGameScreen(window.gameState);
    saveGame(window.gameState);
    showScreen("screen-game");
  });
}

/* ---------------------------------------------------------
   게임 화면 - 주사위 & 턴 진행
--------------------------------------------------------- */
function bindGameScreen() {
  document.getElementById("dice-btn").addEventListener("click", onDiceClick);

  document.getElementById("btn-open-collection").addEventListener("click", () => {
    if (!window.gameState) return;
    collectionReturnScreen = "screen-game";
    renderCollectionScreen(window.gameState);
    showScreen("screen-collection");
  });

  // 모달 안의 버튼은 동적으로 생성되므로 이벤트 위임으로 처리
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "close-modal") {
      hideModal();
    } else if (action === "buy-country") {
      handleBuyDecision(true);
    } else if (action === "skip-buy") {
      handleBuyDecision(false);
    } else if (action === "try-purchase-quiz") {
      handlePurchaseQuizStart();
    } else if (action === "confirm-arrival") {
      finishTurn();
    } else if (action === "quiz-answer") {
      handleQuizAnswer(Number(btn.dataset.choiceIndex));
    } else if (action === "quiz-result-to-arrival") {
      showArrivalCard();
    }
  });
}

let pendingArrival = null; // { countryId, discountRate, quizDone }
let pendingQuiz = null;    // { quiz, context: "purchase" | "event" }
let pendingEventCard = null;

function markVisit(gs, playerId, countryId) {
  recordVisit(gs, playerId, countryId);
  addToTravelLog(countryId);
}

function onDiceClick() {
  const gs = window.gameState;
  if (!gs || gs.isMoving || gs.status === "ended") return;

  gs.isMoving = true;
  document.getElementById("dice-btn").disabled = true;
  document.getElementById("dice-hint").textContent = "";

  const diceFaceEl = document.getElementById("dice-face");
  playDiceAnimation(diceFaceEl, (value) => {
    document.getElementById("dice-hint").textContent = `${value}칸 이동!`;
    animateMove(value);
  });
}

function animateMove(steps) {
  const gs = window.gameState;
  const player = getCurrentPlayer(gs);
  const boardLength = gs.boardLength;
  let remaining = steps;

  const stepInterval = setInterval(() => {
    player.position = (player.position + 1) % boardLength;
    renderBoardDynamic(gs);
    remaining--;
    if (remaining <= 0) {
      clearInterval(stepInterval);
      setTimeout(() => handleArrival(), 150);
    }
  }, 260);
}

/* ---------------------------------------------------------
   도착 처리
--------------------------------------------------------- */
function handleArrival() {
  const gs = window.gameState;
  const player = getCurrentPlayer(gs);
  const tiles = getBoardTiles();
  const tile = tiles[player.position % tiles.length];

  if (tile.type === "start") {
    showModal(`
      <h3 class="modal-title">🚩 출발지</h3>
      <p class="modal-message">출발지를 한 바퀴 돌았어요!</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
    return;
  }

  if (tile.type === "rest") {
    showModal(`
      <h3 class="modal-title">☕ 쉼터</h3>
      <p class="modal-message">잠시 쉬어가는 칸이에요.</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
    return;
  }

  if (tile.type === "event") {
    handleEventTile();
    return;
  }

  // ---- 국가 칸 ----
  markVisit(gs, player.id, tile.countryId);
  const country = getCountryById(tile.countryId);
  const ownerId = getCountryOwnerId(gs, tile.countryId);

  if (ownerId === null) {
    pendingArrival = { countryId: tile.countryId, discountRate: 0, quizDone: false };
    showArrivalCard();
  } else if (ownerId === player.id) {
    showModal(`
      <div class="modal-flag">${country.flag}</div>
      <h3 class="modal-title">${country.nameKo}</h3>
      <p class="modal-message">이미 내가 가진 나라예요! 🏠</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
  } else {
    const owner = gs.players.find((p) => p.id === ownerId);
    const result = payRentIfNeeded(gs, gs.players, player, tile.countryId);
    renderPlayerPanel(gs);
    showModal(`
      <div class="modal-flag">${country.flag}</div>
      <h3 class="modal-title">${country.nameKo}</h3>
      <p class="modal-message">${owner.character} ${escapeAttr(owner.name)}의 나라예요.</p>
      <div class="modal-rent-row negative"><span>${player.character} ${escapeAttr(player.name)}</span><span>-💰${result.amount}</span></div>
      <div class="modal-rent-row positive"><span>${owner.character} ${escapeAttr(owner.name)}</span><span>+💰${result.amount}</span></div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
  }
}

/** 무소유 국가 도착 카드 (구입/퀴즈/지나가기) */
function showArrivalCard() {
  const gs = window.gameState;
  const player = getCurrentPlayer(gs);
  const country = getCountryById(pendingArrival.countryId);
  const price = getEffectivePrice(country, pendingArrival.discountRate);
  const affordable = player.money >= price;
  const discounted = pendingArrival.discountRate > 0;

  const priceLine = discounted
    ? `<span style="text-decoration:line-through;opacity:0.5">${country.price}</span> <b style="color:var(--coral)">${price}</b>`
    : `${price}`;

  showModal(`
    <div class="modal-flag">${country.flag}</div>
    <h3 class="modal-title">${country.nameKo}</h3>
    <div class="modal-info-grid">
      <div class="modal-info-item"><div class="modal-info-label">🏙️ 수도</div><div class="modal-info-value">${country.capitalKo}</div></div>
      <div class="modal-info-item"><div class="modal-info-label">🌍 대륙</div><div class="modal-info-value">${country.continent}</div></div>
      <div class="modal-info-item"><div class="modal-info-label">💰 구매가격</div><div class="modal-info-value">${priceLine}</div></div>
      <div class="modal-info-item"><div class="modal-info-label">💰 통행료</div><div class="modal-info-value">${country.rent}</div></div>
    </div>
    ${
      pendingArrival.quizDone
        ? ""
        : `<button class="btn btn-secondary btn-block quiz-cta" data-action="try-purchase-quiz">🎯 수도 퀴즈 맞히고 20% 할인받기</button>`
    }
    <div class="modal-actions">
      <button class="btn btn-secondary" data-action="skip-buy">지나가기</button>
      <button class="btn btn-primary" data-action="buy-country" ${affordable ? "" : "disabled"}>나라 구입하기</button>
    </div>
    ${affordable ? "" : `<p class="modal-message" style="font-size:0.85rem;color:var(--coral)">돈이 부족해서 살 수 없어요</p>`}
  `);
}

function handlePurchaseQuizStart() {
  const quiz = getCapitalQuizForCountry(pendingArrival.countryId);
  if (!quiz) {
    showArrivalCard();
    return;
  }
  pendingQuiz = { quiz, context: "purchase" };
  showModal(buildQuizModalHTML(quiz, "맞히면 이 나라를 20% 싸게 살 수 있어요"));
}

/* ---------------------------------------------------------
   찬스(이벤트) 칸
--------------------------------------------------------- */
function handleEventTile() {
  const card = drawEventCard();
  pendingEventCard = card;

  if (!card) {
    finishTurn();
    return;
  }

  if (card.type === "bonus" || card.type === "cost") {
    const gs = window.gameState;
    const player = getCurrentPlayer(gs);
    const res = applyMoneyEvent(player, card);
    renderPlayerPanel(gs);
    saveGame(gs);
    const sign = res.delta >= 0 ? "positive" : "negative";
    const amountText = `${res.delta >= 0 ? "+" : "-"}💰${Math.abs(res.delta)}`;
    showModal(`
      <div class="modal-flag">${card.emoji}</div>
      <h3 class="modal-title">${card.title}</h3>
      <div class="modal-rent-row ${sign}"><span>${player.character} ${escapeAttr(player.name)}</span><span>${amountText}</span></div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
    return;
  }

  if (card.type === "quiz") {
    const quiz = getRandomQuiz();
    pendingQuiz = { quiz, context: "event" };
    const reward = window.QUIZ_CONFIG?.eventReward ?? 100;
    showModal(`
      <div class="modal-flag">${card.emoji}</div>
      <h3 class="modal-title">${card.title}</h3>
      ${buildQuizModalHTML(quiz, `맞히면 💰${reward}을 받아요`)}
    `);
    return;
  }

  if (card.type === "travel") {
    const gs = window.gameState;
    const player = getCurrentPlayer(gs);
    const tiles = getBoardTiles();
    const res = applyTravelEvent(gs, player, tiles);
    if (!res) {
      finishTurn();
      return;
    }
    markVisit(gs, player.id, res.countryId);
    renderBoardDynamic(gs);
    saveGame(gs);
    const country = getCountryById(res.countryId);
    showModal(`
      <div class="modal-flag">${card.emoji}</div>
      <h3 class="modal-title">${card.title}</h3>
      <p class="modal-message">${country.flag} <b>${country.nameKo}</b>(으)로 여행을 떠났어요!<br>도감에 기록됐어요 🧳</p>
      <div class="modal-info-grid">
        <div class="modal-info-item"><div class="modal-info-label">🏙️ 수도</div><div class="modal-info-value">${country.capitalKo}</div></div>
        <div class="modal-info-item"><div class="modal-info-label">🌍 대륙</div><div class="modal-info-value">${country.continent}</div></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
    return;
  }

  finishTurn();
}

/* ---------------------------------------------------------
   퀴즈 응답 처리
--------------------------------------------------------- */
function handleQuizAnswer(choiceIndex) {
  if (!pendingQuiz) return;
  const { quiz, context } = pendingQuiz;
  const choice = quiz.choices[choiceIndex];
  const correct = isCorrectAnswer(quiz, choice);
  const gs = window.gameState;
  const player = getCurrentPlayer(gs);

  if (context === "purchase") {
    pendingQuiz = null;
    if (correct) {
      pendingArrival.discountRate = window.QUIZ_CONFIG?.purchaseDiscountRate ?? 0.2;
    }
    pendingArrival.quizDone = true;
    showModal(`
      <div class="modal-flag">${correct ? "🎉" : "🙈"}</div>
      <h3 class="modal-title">${correct ? "정답이에요!" : "아쉬워요"}</h3>
      <p class="modal-message">
        정답은 <b>${quiz.answer}</b>!
        ${correct ? "<br>이 나라를 <b>20% 할인</b>된 가격에 살 수 있어요." : ""}
      </p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="quiz-result-to-arrival">계속</button>
      </div>
    `);
    return;
  }

  // context === "event"
  pendingQuiz = null;
  if (correct) {
    const res = applyQuizReward(player);
    renderPlayerPanel(gs);
    saveGame(gs);
    showModal(`
      <div class="modal-flag">🎉</div>
      <h3 class="modal-title">정답이에요!</h3>
      <p class="modal-message">정답은 <b>${quiz.answer}</b>!</p>
      <div class="modal-rent-row positive"><span>${player.character} ${escapeAttr(player.name)}</span><span>+💰${res.reward}</span></div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
  } else {
    showModal(`
      <div class="modal-flag">🙈</div>
      <h3 class="modal-title">아쉬워요</h3>
      <p class="modal-message">정답은 <b>${quiz.answer}</b>였어요.<br>다음에 다시 도전해요!</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
  }
}

/* ---------------------------------------------------------
   구매 결정
--------------------------------------------------------- */
function handleBuyDecision(wantsToBuy) {
  const gs = window.gameState;
  const player = getCurrentPlayer(gs);

  if (wantsToBuy && pendingArrival) {
    const { countryId, discountRate } = pendingArrival;
    const success = buyCountry(gs, player, countryId, discountRate);
    const country = getCountryById(countryId);
    pendingArrival = null;
    if (success) {
      renderBoardDynamic(gs);
      renderPlayerPanel(gs);
      saveGame(gs);
      showModal(`
        <div class="modal-flag">${country.flag}</div>
        <h3 class="modal-title">구매 완료!</h3>
        <p class="modal-message">${country.nameKo}이(가) 이제 내 나라예요 🎉</p>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
        </div>
      `);
      return;
    }
  }
  pendingArrival = null;
  finishTurn();
}

/* ---------------------------------------------------------
   턴 종료
--------------------------------------------------------- */
function finishTurn() {
  const gs = window.gameState;
  hideModal();
  pendingArrival = null;
  pendingQuiz = null;
  pendingEventCard = null;
  gs.isMoving = false;
  advanceTurn(gs);
  saveGame(gs);

  if (gs.status === "ended") {
    clearSavedGame();
    renderResultScreen(gs);
    showScreen("screen-result");
    return;
  }

  document.getElementById("dice-btn").disabled = false;
  renderGameScreen(gs);
}

/* ---------------------------------------------------------
   여행 도감 화면
--------------------------------------------------------- */
function bindCollectionScreen() {
  document.getElementById("btn-collection-back").addEventListener("click", () => {
    showScreen(collectionReturnScreen);
  });
}

/* ---------------------------------------------------------
   결과 화면
--------------------------------------------------------- */
function bindResultScreen() {
  document.getElementById("btn-play-again").addEventListener("click", () => {
    window.gameState = null;
    showScreen("screen-start");
    document.getElementById("btn-continue").disabled = true;
  });
}

function escapeAttr(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
