/**
 * main.js
 * 앱 진입점. 화면 전환과 턴 진행 흐름을 연결한다.
 * 실제 계산은 game.js / property.js / dice.js / quiz.js / event.js에 위임하고,
 * 화면 표시는 ui.js에 위임한다.
 */

window.gameState = null;
let selectedPlayerCount = 2;
let selectedStartMoney = 300;
let selectedMaxTurns = 24;
let selectedEndMode = "turns";
let collectionReturnScreen = "screen-start"; // 도감에서 "뒤로" 눌렀을 때 돌아갈 화면

document.addEventListener("DOMContentLoaded", () => {
  if (window.applySettingsToDocument) applySettingsToDocument();
  bindStartScreen();
  bindSetupScreen();
  bindGameScreen();
  bindCollectionScreen();
  bindResultScreen();
  preventLongPressMenus();
});

/**
 * 주사위·글자 등을 길게 눌러도 우클릭(컨텍스트) 메뉴나 텍스트 블록지정이 뜨지 않게 한다.
 * 게임에 필요한 입력 요소(select 등)는 그대로 둔다.
 */
function preventLongPressMenus() {
  const isEditable = (el) =>
    el && el.closest && el.closest("input, textarea, select, [contenteditable='true']");

  document.addEventListener("contextmenu", (e) => {
    if (!isEditable(e.target)) e.preventDefault();
  });

  // 길게 눌러 나타나는 선택 핸들 방지 (iOS/안드로이드) — 드래그로 시작되는 selection 취소
  document.addEventListener("selectstart", (e) => {
    if (!isEditable(e.target)) e.preventDefault();
  });
}

/* ---------------------------------------------------------
   시작 화면
--------------------------------------------------------- */
function bindStartScreen() {
  const continueBtn = document.getElementById("btn-continue");
  refreshContinueButton();

  document.getElementById("btn-new-game").addEventListener("click", () => {
    if (window.unlockAudio) window.unlockAudio();
    if (window.resetSetupAssignments) resetSetupAssignments();
    selectedPlayerCount = 2;
    document.querySelectorAll(".count-chip").forEach((chip) => {
      chip.classList.toggle("active", Number(chip.dataset.count) === selectedPlayerCount);
    });
    renderSetupForm(selectedPlayerCount);
    showScreen("screen-setup");
  });

  continueBtn.addEventListener("click", () => {
    if (window.unlockAudio) window.unlockAudio();
    if (window.startBGM) window.startBGM();
    const saved = loadGame();
    if (!saved || !Array.isArray(saved.players) || saved.players.length < 2) {
      // 저장 데이터 손상 — 정리하고 버튼 비활성
      clearSavedGame();
      refreshContinueButton();
      showModal(`
        <h3 class="modal-title">이어할 게임이 없어요</h3>
        <p class="modal-message">저장된 게임을 불러오지 못했어요. 새 게임을 시작해 주세요.</p>
        <div class="modal-actions"><button class="btn btn-primary btn-block" data-action="close-modal">확인</button></div>
      `);
      return;
    }
    saved.isMoving = false; // 이동 도중 저장된 경우 대비 (안 그러면 주사위가 안 눌림)
    saved.status = saved.status === "ended" ? "playing" : saved.status;
    window.gameState = saved;
    buildBoardDOMOnce(window.gameState);
    renderGameScreen(window.gameState);
    showScreen("screen-game");
    startAILoop();
    promptCurrentTurn();
  });

  document.getElementById("btn-collection").addEventListener("click", () => {
    collectionReturnScreen = "screen-start";
    renderCollectionScreen(null);
    showScreen("screen-collection");
  });

  document.getElementById("btn-settings").addEventListener("click", () => {
    if (window.unlockAudio) window.unlockAudio();
    showSettingsModal();
  });

  document.getElementById("btn-how-to-play").addEventListener("click", () => {
    showModal(`
      <h3 class="modal-title">🎲 게임 방법</h3>
      <p class="modal-message" style="text-align:left;font-size:0.95rem;line-height:1.7">
        1. 순서대로 주사위를 굴려 말을 이동해요.<br>
        2. 도착한 나라가 비어 있으면 살 수 있어요.<br>
        &nbsp;&nbsp;&nbsp;수도 퀴즈를 맞히면 <b>20% 싸게</b> 살 수 있어요!<br>
        3. 다른 사람의 나라에 도착하면 통행료를 내요.<br>
        &nbsp;&nbsp;&nbsp;<b>내 나라에 다시 도착하면 🏠별장→🏢빌딩→🏨호텔→🗼랜드마크</b>를<br>
        &nbsp;&nbsp;&nbsp;한 단계씩 지어서 <b>통행료를 더 많이</b> 받을 수 있어요!<br>
        4. <b>모서리 특수 칸</b>을 전략적으로 활용해요:<br>
        &nbsp;&nbsp;&nbsp;• 🏝️ <b>무인도</b>: 1턴 쉬어가거나 탈출비를 내고 출발해요.<br>
        &nbsp;&nbsp;&nbsp;• 💝 <b>사회복지기금</b>: 모인 기금을 <b>잭팟</b>으로 몽땅 수령해요!<br>
        &nbsp;&nbsp;&nbsp;• ✈️ <b>세계여행</b>: 다음 턴에 원하는 나라로 <b>자유롭게 순간이동</b>해요!<br>
        5. <b>❓ 찬스 칸</b>에서는 보너스·퀴즈·여행이 기다려요.<br>
        6. 방문한 나라는 <b>🧳 여행 도감</b>에 모여요.<br>
        7. 정해진 턴이 끝나면 총 자산이 가장 많은 사람이 우승!
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

  document.querySelectorAll(".option-chip-row").forEach((rowEl) => {
    rowEl.addEventListener("click", (e) => {
      const chip = e.target.closest(".option-chip");
      if (!chip) return;
      rowEl.querySelectorAll(".option-chip").forEach((c) => c.classList.toggle("active", c === chip));
      const value = Number(chip.dataset.value);
      if (rowEl.dataset.group === "money") selectedStartMoney = value;
      else if (rowEl.dataset.group === "turns") {
        selectedMaxTurns = value; // 0 = 파산까지
        selectedEndMode = value === 0 ? "bankruptcy" : "turns";
      }
    });
  });

  document.getElementById("btn-back-to-start").addEventListener("click", () => {
    showScreen("screen-start");
  });

  document.getElementById("btn-start-playing").addEventListener("click", () => {
    if (window.unlockAudio) window.unlockAudio();
    if (window.startBGM) window.startBGM();
    const configs = readSetupPlayerConfigs();
    window.gameState = createInitialGameState(configs, {
      startMoney: selectedStartMoney,
      maxTurns: selectedMaxTurns,
      endMode: selectedEndMode,
    });
    buildBoardDOMOnce(window.gameState);
    renderGameScreen(window.gameState);
    saveGame(window.gameState);
    showScreen("screen-game");
    startAILoop();
    promptCurrentTurn();
  });
}

/* ---------------------------------------------------------
   게임 화면 - 주사위 & 턴 진행
--------------------------------------------------------- */
function bindGameScreen() {
  document.getElementById("btn-open-collection").addEventListener("click", () => {
    if (!window.gameState) return;
    if (isModalOpen()) return; // 모달 처리 중에는 화면 이동 금지
    collectionReturnScreen = "screen-game";
    renderCollectionScreen(window.gameState);
    showScreen("screen-collection");
  });

  const btnToggleBgm = document.getElementById("btn-toggle-bgm");
  if (btnToggleBgm) {
    btnToggleBgm.addEventListener("click", () => {
      if (window.unlockAudio) window.unlockAudio();
      if (window.toggleBGM) window.toggleBGM();
    });
  }

  document.getElementById("btn-open-settings-game").addEventListener("click", () => {
    if (isModalOpen()) return;
    if (window.unlockAudio) window.unlockAudio();
    showSettingsModal();
  });

  document.getElementById("btn-exit-game").addEventListener("click", () => {
    if (isModalOpen()) return;
    showModal(`
      <div class="modal-flag">🏠</div>
      <h3 class="modal-title">처음 화면으로 갈까요?</h3>
      <p class="modal-message">지금까지 한 게임은 저장돼요.<br>처음 화면에서 <b>이어하기</b>로 다시 할 수 있어요.</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" data-action="close-modal">계속하기</button>
        <button class="btn btn-primary" data-action="exit-to-start">처음으로</button>
      </div>
    `);
  });

  document.getElementById("player-panel").addEventListener("click", (e) => {
    const tab = e.target.closest(".owned-tab[data-country-id]");
    if (tab) showOwnedCountryCard(tab.dataset.countryId);
  });

  // 모달 안의 버튼은 동적으로 생성되므로 이벤트 위임으로 처리
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) {
      // 터치로 넘어가는 모달(통행료 카드 등): 버튼이 아닌 곳을 눌러도 다음 차례로
      const overlay = document.getElementById("modal-overlay");
      if (overlay.classList.contains("modal--tap") && isModalOpen()) {
        const gs = window.gameState;
        if (gs && gs.status === "playing" && !getCurrentPlayer(gs).isAI) finishTurn();
      }
      return;
    }
    if (btn.disabled) return;
    const action = btn.dataset.action;

    // 진행(턴을 바꾸거나 상태를 넘기는) 버튼은 한 번만 — 연타/AI 중복클릭으로 턴이 건너뛰는 것 방지
    const ONE_SHOT = [
      "buy-country", "skip-buy", "confirm-arrival", "quiz-answer",
      "quiz-result-to-arrival", "try-purchase-quiz", "exit-to-start", "build-upgrade",
      "island-rest", "island-pay", "fly-destination",
    ];
    if (ONE_SHOT.includes(action)) {
      const content = btn.closest("#modal-content");
      if (content) {
        content.querySelectorAll("[data-action]").forEach((b) => {
          if (ONE_SHOT.includes(b.dataset.action)) b.disabled = true;
        });
      }
    }

    if (["confirm-arrival", "skip-buy", "close-modal", "quiz-result-to-arrival", "island-rest", "island-pay"].includes(action)) {
      if (window.playSound) window.playSound("select");
    }

    if (action === "close-modal") {
      hideModal();
    } else if (action === "buy-country") {
      handleBuyDecision(true);
    } else if (action === "skip-buy") {
      handleBuyDecision(false);
    } else if (action === "build-upgrade") {
      handleBuildDecision();
    } else if (action === "island-rest") {
      handleIslandDecision(false);
    } else if (action === "island-pay") {
      handleIslandDecision(true);
    } else if (action === "fly-destination") {
      handleFlyDestination(Number(btn.dataset.tileIndex));
    } else if (action === "try-purchase-quiz") {
      handlePurchaseQuizStart();
    } else if (action === "confirm-arrival") {
      finishTurn();
    } else if (action === "quiz-answer") {
      handleQuizAnswer(Number(btn.dataset.choiceIndex));
    } else if (action === "quiz-result-to-arrival") {
      showArrivalCard();
    } else if (action === "exit-to-start") {
      if (window.pauseBGM) window.pauseBGM();
      const gs = window.gameState;
      if (gs) saveGame(gs);
      hideModal();
      window.gameState = null;
      showScreen("screen-start");
      refreshContinueButton();
    } else if (action === "toggle-sound") {
      const next = saveSettings({ soundOn: !loadSettings().soundOn });
      if (next.soundOn && window.unlockAudio) { window.unlockAudio(); window.playSound && window.playSound("coinGain"); }
      showSettingsModal();
    } else if (action === "toggle-anim") {
      saveSettings({ animOn: !loadSettings().animOn });
      showSettingsModal();
    } else if (action === "toggle-hardquiz") {
      saveSettings({ hardQuiz: !loadSettings().hardQuiz });
      showSettingsModal();
    } else if (action === "toggle-random-countries") {
      saveSettings({ randomCountries: !loadSettings().randomCountries });
      showSettingsModal();
    } else if (action === "open-country-swap") {
      showCountrySwapModal();
    } else if (action === "open-settings") {
      showSettingsModal();
    }
  });

  // 나라 바꾸기 select
  document.getElementById("modal-overlay").addEventListener("change", (e) => {
    const sel = e.target.closest('select[data-role="country-swap"]');
    if (!sel) return;
    const gs = window.gameState;
    if (!gs) return;
    const oldId = sel.dataset.old;
    const newId = sel.value;
    if (window.swapBoardCountry && swapBoardCountry(gs, oldId, newId)) {
      buildBoardDOMOnce(gs);
      renderBoardDynamic(gs);
      renderPlayerPanel(gs);
      saveGame(gs);
      if (window.playSound) window.playSound("move");
      showCountrySwapModal();
    } else {
      sel.value = oldId; // 실패 시 되돌림
    }
  });
}

/* ---------------------------------------------------------
   환경설정 모달 (소리 / 애니메이션)
--------------------------------------------------------- */
function showSettingsModal() {
  const s = loadSettings();
  const row = (label, on, action) => `
    <button class="setting-row" data-action="${action}">
      <span class="setting-label">${label}</span>
      <span class="setting-switch ${on ? "is-on" : ""}"><span class="setting-knob"></span></span>
    </button>`;
  const inGame = !!(window.gameState && window.gameState.status === "playing");
  showModal(`
    <h3 class="modal-title">⚙️ 설정</h3>
    <div class="setting-list">
      ${row("🔊 소리", s.soundOn, "toggle-sound")}
      ${row("✨ 애니메이션", s.animOn, "toggle-anim")}
      ${row("🧠 어려운 퀴즈 (보기 4개)", s.hardQuiz, "toggle-hardquiz")}
      ${row("🎲 새 게임마다 나라 무작위", s.randomCountries, "toggle-random-countries")}
      ${
        inGame
          ? `<button class="setting-row" data-action="open-country-swap">
               <span class="setting-label">🌍 나라 바꾸기</span>
               <span class="setting-go">›</span>
             </button>`
          : ""
      }
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary btn-block" data-action="close-modal">확인</button>
    </div>
  `);
}

/** 나라 바꾸기 모달 (스크롤 위치 유지하며 다시 그림) */
function showCountrySwapModal() {
  const gs = window.gameState;
  if (!gs) return;
  const prev = document.querySelector(".cs-list");
  const st = prev ? prev.scrollTop : 0;
  showModal(buildCountrySwapHTML(gs));
  const now = document.querySelector(".cs-list");
  if (now) now.scrollTop = st;
}

let pendingArrival = null; // { countryId, discountRate, quizDone }
let pendingQuiz = null;    // { quiz, context: "purchase" | "event" }
let pendingEventCard = null;
let pendingBuild = null;   // { countryId } — 내 나라 도착 시 건설 선택 대기

/** 일정 시간 뒤, "다음으로" 모달이 그대로 떠 있으면 자동으로 다음 차례로 넘긴다 */
let autoAdvanceTimer = null;
function turnSnapshot() {
  const gs = window.gameState;
  return gs ? gs.turn + ":" + gs.currentPlayerIndex : "";
}
function autoAdvance(ms) {
  clearTimeout(autoAdvanceTimer);
  const snap = turnSnapshot();
  autoAdvanceTimer = setTimeout(() => {
    // 그 사이에 이미 턴이 넘어갔으면(직접 눌렀거나) 아무것도 하지 않는다
    if (turnSnapshot() !== snap) return;
    const confirmBtn = document.querySelector('#modal-overlay [data-action="confirm-arrival"]');
    if (isModalOpen() && confirmBtn && window.gameState && window.gameState.status === "playing") {
      finishTurn();
    }
  }, ms);
}

/** 보유 국가 탭을 눌렀을 때 그 나라 카드를 보여준다 (게임 진행에는 영향 없음) */
function showOwnedCountryCard(countryId) {
  const gs = window.gameState;
  const country = getCountryById(countryId);
  if (!country) return;
  const ownerId = gs ? getCountryOwnerId(gs, countryId) : null;
  const owner = ownerId != null ? gs.players.find((p) => p.id === ownerId) : null;
  showModal(`
    ${buildCountryCard(country, { ownerName: owner ? owner.name : "--" })}
    <div class="modal-actions">
      <button class="btn btn-primary btn-block" data-action="close-modal">닫기</button>
    </div>
  `);
}

function markVisit(gs, playerId, countryId) {
  recordVisit(gs, playerId, countryId);
  addToTravelLog(countryId);
}

/** 현재 플레이어의 "차례 카드"를 게임판 가운데에 띄운다 */
function promptCurrentTurn() {
  const gs = window.gameState;
  if (!gs || gs.status !== "playing") return;
  if (document.getElementById("screen-game").classList.contains("hidden")) return;
  if (isModalOpen()) return;

  const player = getCurrentPlayer(gs);

  // 1) 세계여행 대기 중이면 즉시 목적지 선택 모달 오픈
  if (player.pendingFly) {
    showWorldTourModal(player);
    return;
  }

  // 2) 무인도에 갇혀 있으면 탈출 결정 모달 오픈
  if (player.islandTurns > 0) {
    showIslandEscapeModal(player);
    return;
  }

  showTurnPrompt(player, onDiceClick);
}

/** 무인도 탈출 모달 (쉬어가기 vs 탈출비 내고 출발) */
function showIslandEscapeModal(player) {
  const gs = window.gameState;
  const escapeCost = 15; // 15만원
  const canAfford = player.money >= escapeCost;

  showModal(`
    <div class="modal-flag">🏝️</div>
    <h3 class="modal-title">${escapeAttr(player.name)}님은 무인도에 있어요!</h3>
    <p class="modal-message">
      잔여 대기: <b>${player.islandTurns}턴</b><br>
      조용히 쉬어가거나, 탈출비 <b>${won(escapeCost)}</b>을 내고 즉시 출발할 수 있어요.<br>
      <span style="font-size:0.85rem;color:#c9184a">※ 탈출비는 사회복지기금에 따뜻하게 적립됩니다!</span>
    </p>
    <div class="modal-actions">
      <button class="btn btn-secondary" data-action="island-rest">🏖️ 1턴 쉬어가기</button>
      <button class="btn btn-primary" data-action="island-pay" ${canAfford ? "" : "disabled"}>💰 탈출비 내고 출발</button>
    </div>
  `);
}

function handleIslandDecision(payEscape) {
  const gs = window.gameState;
  if (!gs || gs.status !== "playing") return;
  const player = getCurrentPlayer(gs);
  const escapeCost = 15;

  if (payEscape && player.money >= escapeCost) {
    player.money -= escapeCost;
    gs.welfareFund = (gs.welfareFund || 0) + escapeCost; // 복지기금에 기부
    player.islandTurns = 0;
    hideModal();
    renderPlayerPanel(gs);
    renderBoardDynamic(gs);
    saveGame(gs);
    if (window.flashMoney) flashMoney(player.id, -escapeCost);
    if (window.playSound) window.playSound("coinGain");
    onDiceClick(); // 즉시 출발
  } else {
    // 1턴 쉬기
    player.islandTurns = Math.max((player.islandTurns || 1) - 1, 0);
    hideModal();
    renderPlayerPanel(gs);
    saveGame(gs);
    finishTurn();
  }
}

/** 세계여행 목적지 선택 모달 */
function showWorldTourModal(player) {
  const gs = window.gameState;
  const tiles = getBoardTiles();
  const countryTiles = tiles.filter((t) => t.type === "country");

  const cardsHTML = countryTiles.map((t) => {
    const c = getCountryById(t.countryId);
    if (!c) return "";
    const ownerId = getCountryOwnerId(gs, t.countryId);
    const owner = ownerId != null ? gs.players.find((p) => p.id === ownerId) : null;
    const bldLv = getBuildingLevel(gs, t.countryId);
    const bldStage = (window.BUILDING_STAGES || [])[bldLv];
    const rent = getCurrentRent(gs, t.countryId);

    return `
      <button type="button" class="tour-pick-item" data-action="fly-destination" data-tile-index="${t.index}">
        <span class="tour-pick-flag">${flagMarkup(c)}</span>
        <span class="tour-pick-name">${escapeAttr(c.nameKo)}</span>
        <span class="tour-pick-meta">
          ${owner ? (owner.id === player.id ? `<b style="color:var(--sky-deep)">내 땅 ${bldStage?.emoji||""}</b>` : `${escapeAttr(owner.name)}`) : `<b style="color:var(--grass)">빈 땅 (${won(c.price)})</b>`}
        </span>
      </button>
    `;
  }).join("");

  showModal(`
    <div class="modal-flag">✈️</div>
    <h3 class="modal-title">세계여행 목적지를 선택하세요!</h3>
    <p class="modal-message">어느 나라로 날아갈까요? 원하는 나라를 터치하세요.</p>
    <div class="tour-grid">${cardsHTML}</div>
    <div class="modal-actions" style="margin-top:12px">
      <button class="btn btn-secondary btn-block" data-action="close-modal">닫기</button>
    </div>
  `);
}

function handleFlyDestination(destIndex) {
  const gs = window.gameState;
  if (!gs || gs.status !== "playing") return;
  const player = getCurrentPlayer(gs);
  player.pendingFly = false;
  hideModal();

  if (window.playSound) window.playSound("planeFly");
  player.position = destIndex;
  renderBoardDynamic(gs, { landed: true });
  renderPlayerPanel(gs);
  saveGame(gs);

  setTimeout(() => {
    handleArrival();
  }, 400);
}

function onDiceClick() {
  if (window.unlockAudio) window.unlockAudio();
  const gs = window.gameState;
  if (!gs || gs.isMoving || gs.status === "ended") return;

  gs.isMoving = true;
  rollDiceInCenter((value) => {
    animateMove(value);
  });
}

/** 출발칸을 지났으면(또는 밟았으면) 여행 자금을 지급한다 */
function grantPassStartBonus(gs, player, oldPos, steps) {
  const bonus = window.PASS_START_BONUS ?? 46;
  if (oldPos + steps >= gs.boardLength) {
    player.money += bonus;
    renderPlayerPanel(gs);
    if (window.flashMoney) flashMoney(player.id, bonus);
    if (window.playSound) window.playSound("coinGain");
  }
}

/** 타일 바닥에 만화 발자국 먼지(Puff Dust) 파티클을 퐁 피워 올린다 */
function spawnTileDust(tileIndex) {
  try {
    const tiles = getBoardTiles();
    const tile = tiles[tileIndex % tiles.length];
    if (!tile) return;
    const tileEl = document.querySelector(`.tile[data-index="${tile.index}"]`);
    if (!tileEl) return;
    const dust = document.createElement("span");
    dust.className = "hop-dust";
    tileEl.appendChild(dust);
    setTimeout(() => {
      if (dust && dust.parentNode) dust.parentNode.removeChild(dust);
    }, 380);
  } catch (e) {
    // 무중단 안전 보장
  }
}

/** 최종 도착 시 타일 충격파 링과 보드 화면 진동(Screen Shake) 발동 */
function triggerArrivalImpact(tileIndex) {
  try {
    const tiles = getBoardTiles();
    const tile = tiles[tileIndex % tiles.length];
    if (!tile) return;
    const tileEl = document.querySelector(`.tile[data-index="${tile.index}"]`);
    if (tileEl) {
      tileEl.classList.remove("tile--shockwave");
      void tileEl.offsetWidth;
      tileEl.classList.add("tile--shockwave");
      setTimeout(() => {
        if (tileEl) tileEl.classList.remove("tile--shockwave");
      }, 550);
    }

    const board = document.getElementById("board");
    if (board) {
      board.classList.remove("board--impact-shake");
      void board.offsetWidth;
      board.classList.add("board--impact-shake");
      setTimeout(() => {
        if (board) board.classList.remove("board--impact-shake");
      }, 320);
    }
  } catch (e) {
    // 무중단 안전 보장
  }
}

function animateMove(steps) {
  const gs = window.gameState;
  const player = getCurrentPlayer(gs);
  const boardLength = gs.boardLength;
  const oldPos = player.position;

  if (window.prefersReducedAnim && window.prefersReducedAnim()) {
    player.position = (player.position + steps) % boardLength;
    grantPassStartBonus(gs, player, oldPos, steps);
    renderBoardDynamic(gs, { landed: true });
    setTimeout(() => handleArrival(), 200);
    return;
  }

  let remaining = steps;
  function doNextStep() {
    if (remaining <= 0) {
      // 최종 도착
      grantPassStartBonus(gs, player, oldPos, steps);
      triggerArrivalImpact(player.position);
      if (window.playSound) window.playSound("heavyLand");
      setTimeout(() => handleArrival(), 400);
      return;
    }

    player.position = (player.position + 1) % boardLength;
    remaining--;
    const last = remaining === 0;

    // 만화 발자국 먼지 생성
    spawnTileDust(player.position);

    renderBoardDynamic(gs, { hopPlayerId: player.id, landed: last });
    if (window.playSound) window.playSound(last ? "heavyLand" : "step");

    // 역동적인 리듬 가감속: 출발 시 240ms, 중간 200ms, 마지막 칸 직전 300ms 서스펜스
    const nextDelay = last ? 320 : (remaining === 1 ? 280 : 210);
    setTimeout(doNextStep, nextDelay);
  }

  doNextStep();
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
      <div class="modal-flag">🚩</div>
      <h3 class="modal-title">출발!</h3>
      <p class="modal-message">출발칸을 밟았어요.<br>여행 자금 <b>${won(window.PASS_START_BONUS ?? 46)}</b>을 받았어요!</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
    return;
  }

  if (tile.type === "island") {
    player.islandTurns = 1;
    if (window.playSound) window.playSound("islandDrop");
    renderPlayerPanel(gs);
    renderBoardDynamic(gs);
    saveGame(gs);
    const islandHTML = `
      <div class="modal-flag">🏝️</div>
      <h3 class="modal-title">무인도 도착</h3>
      <p class="modal-message">바다 한가운데 무인도에 조난당했어요!<br>다음 차례에 <b>1턴 쉬어가거나</b> 소액의 탈출비로 탈출할 수 있어요.</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">확인</button>
      </div>
    `;
    if (window.showFxBurst) {
      showFxBurst("pop", { emoji: "🏝️", text: "무인도 조난!", onDone: () => showModal(islandHTML) });
    } else {
      showModal(islandHTML);
    }
    return;
  }

  if (tile.type === "welfare") {
    const jackpot = Math.max(gs.welfareFund || 50, 20);
    player.money += jackpot;
    gs.welfareFund = 20; // 수령 후 기초 기금으로 초기화
    renderPlayerPanel(gs);
    renderBoardDynamic(gs);
    saveGame(gs);
    if (window.flashMoney) flashMoney(player.id, jackpot);
    if (window.playSound) window.playSound("welfareJackpot");
    const welfareHTML = `
      <div class="modal-flag">💝</div>
      <h3 class="modal-title" style="color:var(--grass)">사회복지기금 잭팟!</h3>
      <p class="modal-message">그동안 쌓인 따뜻한 복지기금<br><b style="font-size:1.4rem;color:#c9184a">💰 ${won(jackpot)}</b>을 모두 받았어요! 🎉</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">감사합니다!</button>
      </div>
    `;
    if (window.showFxBurst) {
      showFxBurst("buy", { text: `기금 대박! +${won(jackpot)}`, onDone: () => showModal(welfareHTML) });
    } else {
      showModal(welfareHTML);
    }
    return;
  }

  if (tile.type === "travel") {
    player.pendingFly = true;
    if (window.playSound) window.playSound("planeFly");
    renderPlayerPanel(gs);
    renderBoardDynamic(gs);
    saveGame(gs);
    const travelHTML = `
      <div class="modal-flag">✈️</div>
      <h3 class="modal-title" style="color:var(--sky-deep)">세계여행 공항 도착</h3>
      <p class="modal-message">여권을 챙기세요! 🧳<br>다음 차례에 주사위를 굴리지 않고<br><b>원하는 나라로 어디든 즉시 날아갑니다!</b></p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">기대돼요!</button>
      </div>
    `;
    if (window.showFxBurst) {
      showFxBurst("pop", { emoji: "✈️", text: "세계여행 대기!", onDone: () => showModal(travelHTML) });
    } else {
      showModal(travelHTML);
    }
    return;
  }

  if (tile.type === "rest") {
    if (window.playSound) window.playSound("restStop");
    const restHTML = `
      <div class="modal-flag">🍔</div>
      <h3 class="modal-title">쉼터</h3>
      <p class="modal-message">햄버거랑 음료 한 잔 하고<br>잠시 쉬어가요 😋</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `;
    if (window.showFxBurst) {
      showFxBurst("pop", { emoji: "🍔", text: "쉼터!", onDone: () => showModal(restHTML) });
    } else {
      showModal(restHTML);
    }
    return;
  }

  if (tile.type === "event") {
    if (window.playSound) window.playSound("keyReveal");
    if (window.showFxBurst) {
      showFxBurst("pop", { emoji: "🗝️", text: "황금열쇠!", onDone: () => handleEventTile() });
    } else {
      handleEventTile();
    }
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
    // 내 나라에 다시 도착 → 건물을 한 단계 짓을 수 있다
    pendingBuild = { countryId: tile.countryId };
    showBuildCard();
  } else {
    const owner = gs.players.find((p) => p.id === ownerId);
    const result = payRentIfNeeded(gs, gs.players, player, tile.countryId);
    renderBoardDynamic(gs);
    renderPlayerPanel(gs);

    // 🎟️ 통행료 면제 우대권으로 방어한 경우
    if (result.shielded) {
      if (window.playSound) window.playSound("keyReveal");
      const shieldHTML = `
        <div class="modal-flag">🎟️</div>
        <h3 class="modal-title" style="color:var(--st-sun, #ffd23f)">우대권 사용!</h3>
        <p class="modal-message">
          <b>${escapeAttr(owner.name)}</b>의 나라(원래 통행료 ${won(result.amount)})에 도착했지만,<br>
          소지하고 있던 <b>🎟️ 통행료 면제 우대권</b>이 발동되어<br>
          <b style="font-size:1.35rem;color:var(--grass, #4ade80)">통행료 0원(무료 통과)!</b>
        </p>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" data-action="confirm-arrival">다행이다! 휴~</button>
        </div>
      `;
      if (window.showFxBurst) {
        showFxBurst("pop", { emoji: "🎟️", text: "우대권 방어!", onDone: () => showModal(shieldHTML) });
      } else {
        showModal(shieldHTML);
      }
      return;
    }

    if (window.flashMoney) flashMoney(owner.id, result.amount);
    if (window.playSound) window.playSound("rentImpact");

    if (result.bankrupt) {
      const bankruptHTML = `
        <div class="modal-flag">💀</div>
        <h3 class="modal-title">${escapeAttr(player.name)} 파산…</h3>
        <p class="modal-message">${escapeAttr(owner.name)}의 <b>${escapeAttr(country.nameKo)}</b> 통행료 <b>${won(result.amount)}</b>을 못 냈어요.<br>가진 나라를 모두 내놓고 게임에서 빠집니다.</p>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
        </div>
      `;
      showFxBurst("rent", { text: `${player.name} 파산!`, onDone: () => showModal(bankruptHTML) });
      return;
    }

    if (window.flashMoney) flashMoney(player.id, -result.amount);
    const monoNotice = result.isMonopoly
      ? `<div class="modal-monopoly-notice">👑 [${result.continent}] 대륙 독점 보너스 ×1.5배 적용!</div>`
      : "";
    const rentModalHTML = `
      <div class="modal-flag">💸</div>
      <h3 class="modal-title" style="color:var(--coral)">${escapeAttr(owner.name)}의 나라에 걸렸어요!</h3>
      ${buildCountryCard(country, { travelerName: player.name, ownerName: owner.name, myMoney: player.money, rent: result.amount, building: getBuildingStageOf(gs, tile.countryId) })}
      ${monoNotice}
      <div class="modal-rent-row negative"><span>${pcMarkup(player)} ${escapeAttr(player.name)}</span><span>-${won(result.amount)}</span></div>
      <div class="modal-rent-row positive"><span>${pcMarkup(owner)} ${escapeAttr(owner.name)}</span><span>+${won(result.amount)}</span></div>
      <button class="btn btn-primary btn-block modal-tap-hint" data-action="confirm-arrival">👆 화면을 터치하면 넘어가요</button>
    `;
    showFxBurst("rent", {
      text: `${owner.name}에게 통행료 ${won(result.amount)}!`,
      onDone: () => showModal(rentModalHTML, { tapAnywhere: true }),
    });
  }
}

/* ---------------------------------------------------------
   건물 업그레이드 (별장 → 빌딩 → 호텔 → 랜드마크)
--------------------------------------------------------- */
/** 나라의 현재 건물 단계 정보 (없으면 null) */
function getBuildingStageOf(gs, countryId) {
  const lv = getBuildingLevel(gs, countryId);
  return lv > 0 ? (window.BUILDING_STAGES || [])[lv] || null : null;
}

/** 내 나라 도착 카드: 현재 단계와 다음 단계 건설 선택 */
function showBuildCard() {
  const gs = window.gameState;
  if (!gs || !pendingBuild) return;
  const player = getCurrentPlayer(gs);
  const country = getCountryById(pendingBuild.countryId);
  if (!country) { finishTurn(); return; }

  const stages = window.BUILDING_STAGES || [];
  const level = getBuildingLevel(gs, country.id);
  const cur = stages[level] || stages[0];
  const rentNow = getCurrentRent(gs, country.id);
  const info = getNextBuildInfo(gs, country.id);
  const card = buildCountryCard(country, {
    travelerName: player.name,
    ownerName: `${player.name}(나)`,
    myMoney: player.money,
    rent: rentNow,
    building: level > 0 ? cur : null,
  });

  if (!info) {
    showModal(`
      ${card}
      <p class="modal-message">🗼 <b>랜드마크</b>까지 다 지었어요!<br>더 이상 짓지 못해요.</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `);
    pendingBuild = null;
    return;
  }

  const affordable = player.money >= info.cost;
  showModal(`
    ${card}
    <div class="build-panel">
      <div class="build-now">현재 ${cur.emoji} ${escapeAttr(cur.label)} · 통행료 <b>${won(rentNow)}</b></div>
      <div class="build-next">
        <span class="build-next-icon">${info.stage.emoji}</span>
        <span class="build-next-text">
          <b>${escapeAttr(info.stage.label)}</b> 짓기 <b class="build-cost">${won(info.cost)}</b><br>
          통행료 <b>${won(rentNow)}</b> → <b class="build-rent-up">${won(info.rentAfter)}</b> (×${info.stage.rentMul})
        </span>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" data-action="confirm-arrival">지나가기</button>
      <button class="btn btn-primary" data-action="build-upgrade" ${affordable ? "" : "disabled"}>🔨 짓기</button>
    </div>
    ${affordable ? "" : `<p class="modal-message" style="font-size:0.85rem;color:var(--coral)">돈이 부족해서 짓지 못해요</p>`}
  `);
}

/** 건설 확정 — 한 번만 처리(중복 클릭·AI 재클릭 방지), 오류가 나도 턴은 정상 진행 */
function handleBuildDecision() {
  const gs = window.gameState;
  if (!gs || gs.status !== "playing") return;
  const target = pendingBuild;
  pendingBuild = null; // 먼저 소비
  if (!target) return;

  try {
    const player = getCurrentPlayer(gs);
    const country = getCountryById(target.countryId);
    const res = buildNextLevel(gs, player, target.countryId);
    if (!res || !country) { finishTurn(); return; }

    hideModal();
    renderBoardDynamic(gs, { builtCountryId: country.id });
    renderPlayerPanel(gs);
    saveGame(gs);
    if (window.flashMoney) flashMoney(player.id, -res.cost);
    const isLandmark = res.level >= (window.BUILDING_MAX_LEVEL ?? 4);
    if (window.playSound) window.playSound(isLandmark ? "buildLandmark" : "build");

    const rentNow = getCurrentRent(gs, country.id);
    const doneHTML = `
      ${buildCountryCard(country, { travelerName: player.name, ownerName: `${player.name}(나)`, myMoney: player.money, rent: rentNow, building: res.stage })}
      <h3 class="modal-title" style="color:var(--grass)">${res.stage.emoji} ${escapeAttr(res.stage.label)} 완공!</h3>
      <p class="modal-message">이제 다른 친구가 이 나라에 걸리면<br>통행료 <b>${won(rentNow)}</b>를 내요!</p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
      </div>
    `;
    const fxText = `${country.nameKo} ${res.stage.label} 완공!`;
    const showDone = () => {
      showModal(doneHTML);
      autoAdvance(2600); // 잠깐 보여주고 자동으로 다음 차례로
    };
    if (window.showFxBurst) {
      showFxBurst(isLandmark ? "buy" : "pop", { emoji: res.stage.emoji, text: fxText, onDone: showDone });
    } else {
      showDone();
    }
  } catch (err) {
    console.error("건설 처리 오류:", err);
    finishTurn();
  }
}

/** 무소유 국가 도착 카드 (구입/퀴즈/지나가기) */
function showArrivalCard() {
  const gs = window.gameState;
  if (!pendingArrival) return; // 이미 처리됨
  const player = getCurrentPlayer(gs);
  const country = getCountryById(pendingArrival.countryId);
  const price = getEffectivePrice(country, pendingArrival.discountRate);
  const affordable = player.money >= price;
  const discounted = pendingArrival.discountRate > 0;

  const priceLabelHTML = discounted
    ? `<span style="text-decoration:line-through;opacity:0.5">${won(country.price)}</span> <b style="color:var(--coral)">${won(price)}</b>`
    : won(price);

  showModal(`
    ${buildCountryCard(country, {
      travelerName: player.name,
      ownerName: "",
      myMoney: player.money,
      price,
      priceLabelHTML,
      rent: country.rent,
    })}
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
    if (window.flashMoney) flashMoney(player.id, res.delta);
    if (window.playSound) window.playSound(res.delta >= 0 ? "coinGain" : "coinLoss");
    showModal(`
      <div class="modal-flag">${card.emoji}</div>
      <h3 class="modal-title">🗝️ ${card.title}</h3>
      ${prizeRow(player, res.delta)}
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
      <div class="modal-flag">🗝️</div>
      <h3 class="modal-title">${card.title}</h3>
      ${buildQuizModalHTML(quiz, `맞히면 ${won(reward)}을 받아요`)}
    `);
    return;
  }

  if (card.type === "free_upgrade") {
    const gs = window.gameState;
    const player = getCurrentPlayer(gs);
    const res = applyFreeUpgrade(gs, player);
    renderBoardDynamic(gs, { builtCountryId: res.countryId });
    renderPlayerPanel(gs);
    saveGame(gs);
    if (res.success) {
      if (window.playSound) window.playSound(res.level >= 4 ? "buildLandmark" : "build");
      showModal(`
        <div class="modal-flag">🏗️</div>
        <h3 class="modal-title" style="color:var(--grass)">무료 건축 지원권!</h3>
        <p class="modal-message">
          소유한 <b>${escapeAttr(res.countryName)}</b>에<br>
          <b>${res.stage.emoji} ${escapeAttr(res.stage.label)}</b>(통행료 ×${res.stage.rentMul})을 무료로 올렸어요! ✨
        </p>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" data-action="confirm-arrival">신난다!</button>
        </div>
      `);
    } else {
      if (window.playSound) window.playSound("coinGain");
      showModal(`
        <div class="modal-flag">🎁</div>
        <h3 class="modal-title">특별 여행 지원금</h3>
        <p class="modal-message">
          아직 건물을 올릴 소유 나라가 없어서<br>
          대신 따뜻한 여행 지원금 <b>${won(res.fallbackBonus)}</b>을 받았어요!
        </p>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" data-action="confirm-arrival">감사합니다!</button>
        </div>
      `);
    }
    return;
  }

  if (card.type === "toll_shield") {
    const gs = window.gameState;
    const player = getCurrentPlayer(gs);
    const res = applyTollShield(player);
    renderPlayerPanel(gs);
    saveGame(gs);
    if (window.playSound) window.playSound("keyReveal");
    showModal(`
      <div class="modal-flag">🎟️</div>
      <h3 class="modal-title" style="color:var(--st-sun, #ffd23f)">통행료 면제 우대권!</h3>
      <p class="modal-message">
        상대방의 비싼 랜드마크에 걸렸을 때<br>
        <b>자동으로 통행료를 0원으로 막아주는</b><br>
        황금 우대권을 획득했어요! (보유: ${res.count}장)
      </p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">든든하다!</button>
      </div>
    `);
    return;
  }

  if (card.type === "welfare_gift") {
    const gs = window.gameState;
    const player = getCurrentPlayer(gs);
    const res = applyWelfareGift(gs, player, card.amount || 20);
    renderPlayerPanel(gs);
    saveGame(gs);
    if (window.flashMoney) flashMoney(player.id, res.amount);
    if (window.playSound) window.playSound("coinGain");
    showModal(`
      <div class="modal-flag">💝</div>
      <h3 class="modal-title" style="color:var(--grass)">복지기금 특별 장학금</h3>
      <p class="modal-message">
        성실한 세계 탐험가로 선정되어<br>
        복지기금에서 <b>+${won(res.amount)}</b>의 장학금을 지원받았어요!
      </p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">감사합니다!</button>
      </div>
    `);
    return;
  }

  if (card.type === "jump") {
    const gs = window.gameState;
    const player = getCurrentPlayer(gs);
    const tiles = getBoardTiles();
    const res = applyJumpEvent(gs, player, card.steps, tiles);
    renderBoardDynamic(gs, { landed: true });
    renderPlayerPanel(gs);
    saveGame(gs);
    if (window.playSound) window.playSound(card.steps > 0 ? "step" : "pop");
    showModal(`
      <div class="modal-flag">${card.emoji}</div>
      <h3 class="modal-title">${card.title}</h3>
      <p class="modal-message">${escapeAttr(card.desc)}<br><b style="color:var(--sky-deep)">${card.steps > 0 ? `앞으로 ${card.steps}칸 전진!` : `뒤로 ${Math.abs(card.steps)}칸 후진!`}</b></p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">확인</button>
      </div>
    `);
    return;
  }

  if (card.type === "go_airport") {
    const gs = window.gameState;
    const player = getCurrentPlayer(gs);
    const tiles = getBoardTiles();
    const res = applyGoAirport(gs, player, tiles);
    renderBoardDynamic(gs, { landed: true });
    renderPlayerPanel(gs);
    saveGame(gs);
    if (window.playSound) window.playSound("planeFly");
    showModal(`
      <div class="modal-flag">🛫</div>
      <h3 class="modal-title" style="color:var(--sky-deep)">공항 직행 고속티켓!</h3>
      <p class="modal-message">
        세계여행(공항) 칸으로 즉시 이동했어요!<br>
        <b>다음 차례에 원하는 나라로 바로 날아갑니다! ✈️</b>
      </p>
      <div class="modal-actions">
        <button class="btn btn-primary btn-block" data-action="confirm-arrival">좋았어!</button>
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
  pendingQuiz = null; // 소비 — 중복 클릭 방지
  if (context === "purchase" && !pendingArrival) {
    finishTurn();
    return;
  }
  const choice = quiz.choices[choiceIndex];
  const correct = isCorrectAnswer(quiz, choice);
  const gs = window.gameState;
  const player = getCurrentPlayer(gs);

  if (window.playSound) window.playSound(correct ? "quizCorrect" : "quizWrong");

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
    if (window.flashMoney) flashMoney(player.id, res.reward);
    showModal(`
      <div class="modal-flag">🎉</div>
      <h3 class="modal-title">정답이에요!</h3>
      <p class="modal-message">정답은 <b>${quiz.answer}</b>!</p>
      ${prizeRow(player, res.reward)}
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
  if (!gs || gs.status !== "playing") return;

  // pendingArrival을 먼저 소비 — 중복 호출(연타·AI 재클릭) 시 두 번째부터는 그냥 무시
  const arrival = pendingArrival;
  pendingArrival = null;
  if (!arrival) return;

  const player = getCurrentPlayer(gs);

  if (wantsToBuy) {
    const { countryId, discountRate } = arrival;
    const success = buyCountry(gs, player, countryId, discountRate);
    const country = getCountryById(countryId);
    if (success) {
      hideModal(); // 연출(FX) 동안 도착 카드가 남아 다시 눌리는 것 방지
      renderBoardDynamic(gs);
      renderPlayerPanel(gs);
      saveGame(gs);
      if (window.flashMoney) flashMoney(player.id, -getEffectivePrice(country, discountRate));
      if (window.playSound) window.playSound("buyFanfare");
      const buyModalHTML = `
        ${buildCountryCard(country, { travelerName: player.name, ownerName: `${player.name}(나)`, myMoney: player.money })}
        <h3 class="modal-title" style="color:var(--grass)">구매 완료! 🎉</h3>
        <p class="modal-message">${escapeAttr(country.nameKo)}이(가) 이제 내 나라예요</p>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" data-action="confirm-arrival">다음으로</button>
        </div>
      `;
      showFxBurst("buy", {
        text: `${country.nameKo} 구입!`,
        onDone: () => {
          showModal(buyModalHTML);
          autoAdvance(2600); // 나라 카드를 잠깐 보여주고 자동으로 다음 차례로
        },
      });
      return;
    }
  }
  finishTurn();
}

/* ---------------------------------------------------------
   턴 종료
--------------------------------------------------------- */
function finishTurn() {
  const gs = window.gameState;
  clearTimeout(autoAdvanceTimer);
  if (!gs || gs.status !== "playing") {
    hideModal();
    return;
  }
  hideModal();
  pendingArrival = null;
  pendingQuiz = null;
  pendingEventCard = null;
  pendingBuild = null;
  gs.isMoving = false;
  advanceTurn(gs);
  saveGame(gs);

  if (gs.status === "ended") {
    clearSavedGame();
    if (window.pauseBGM) window.pauseBGM();
    if (window.playSound) window.playSound("win");
    renderResultScreen(gs);
    showScreen("screen-result");
    return;
  }

  renderGameScreen(gs);
  promptCurrentTurn();
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
    refreshContinueButton();
  });
}

/* ---------------------------------------------------------
   AI 플레이어 드라이버
   - 게임 화면이 켜져 있는 동안 주기적으로 동작
   - 현재 플레이어가 AI일 때만 주사위/모달을 대신 처리한다
--------------------------------------------------------- */
let aiLoopTimer = null;

function startAILoop() {
  if (aiLoopTimer) return;
  aiLoopTimer = setInterval(aiTick, 950);
}

/**
 * 매 틱마다 최대 1개의 "동기" 행동만 한다(주사위 굴리기 또는 모달 버튼 1번 클릭).
 * 모든 행동이 동기이므로 틱이 겹칠 일이 없고, 느려지면 게임이 천천히 진행될 뿐 멈추지 않는다.
 */
function aiTick() {
  const gs = window.gameState;
  if (!gs || gs.status !== "playing") return;
  if (document.getElementById("screen-game").classList.contains("hidden")) return;

  const player = getCurrentPlayer(gs);
  if (!player || !player.isAI) return;
  if (gs.isMoving && document.getElementById("modal-overlay").classList.contains("hidden")) {
    return; // 이동 애니메이션 중 — 기다린다
  }

  const overlay = document.getElementById("modal-overlay");
  if (overlay.classList.contains("hidden")) {
    onDiceClick(); // AI 차례인데 아직 안 굴렸으면 굴린다
    return;
  }
  aiResolveModal(gs, player, overlay);
}

function aiClick(el) {
  if (el && !el.disabled) el.click();
}

function aiResolveModal(gs, player, overlay) {
  const has = (action) => overlay.querySelector(`[data-action="${action}"]`);

  // 설정 모달·정보용 나라 카드는 사용자가 연 것 — 게임 행동 버튼이 없으면 AI가 건드리지 않는다
  if (has("toggle-sound") || has("toggle-anim")) return;
  const actionable =
    has("buy-country") || has("skip-buy") || has("confirm-arrival") ||
    has("quiz-answer") || has("quiz-result-to-arrival") || has("try-purchase-quiz") ||
    has("island-pay") || has("island-rest") || has("fly-destination");
  if (!actionable) return;

  // 1) 퀴즈 보기가 있으면 답을 고른다
  if (has("quiz-answer") && pendingQuiz) {
    const idx = aiQuizChoiceIndex(pendingQuiz.quiz);
    const btn = overlay.querySelector(`[data-action="quiz-answer"][data-choice-index="${idx}"]`);
    aiClick(btn || overlay.querySelector('[data-action="quiz-answer"]'));
    return;
  }

  // 2) 국가 도착 카드 (구입/퀴즈도전/지나가기)
  if (has("buy-country") || has("skip-buy")) {
    const country = pendingArrival ? getCountryById(pendingArrival.countryId) : null;
    if (country && pendingArrival) {
      const discounted = getEffectivePrice(country, pendingArrival.discountRate);
      const full = country.price;
      if (has("try-purchase-quiz") && !pendingArrival.quizDone &&
          aiShouldTryPurchaseQuiz(player, full, getEffectivePrice(country, window.QUIZ_CONFIG?.purchaseDiscountRate ?? 0.2))) {
        aiClick(has("try-purchase-quiz"));
        return;
      }
      if (aiShouldBuy(player, discounted) && has("buy-country") && !has("buy-country").disabled) {
        aiClick(has("buy-country"));
        return;
      }
    }
    aiClick(has("skip-buy"));
    return;
  }

  // 4) 무인도 탈출 결정 — 여유 자금(60만 이상)이 있으면 탈출비 내고 즉시 출발
  if (has("island-pay") || has("island-rest")) {
    if (player.money >= 60 && has("island-pay") && !has("island-pay").disabled) {
      aiClick(has("island-pay"));
    } else {
      aiClick(has("island-rest"));
    }
    return;
  }

  // 5) 세계여행 목적지 선택 — 빈 땅 중 비싼 곳 또는 내 땅 우선
  if (has("fly-destination")) {
    const items = Array.from(overlay.querySelectorAll('[data-action="fly-destination"]'));
    if (items.length > 0) {
      // 우선순위 1: 살 수 있는 빈 땅 중 가장 비싼 곳
      const unowned = items.filter((el) => el.textContent.includes("빈 땅"));
      if (unowned.length > 0) {
        aiClick(unowned[Math.floor(Math.random() * unowned.length)]);
      } else {
        // 우선순위 2: 내 땅 (건물 업그레이드)
        const myLands = items.filter((el) => el.textContent.includes("내 땅"));
        if (myLands.length > 0) {
          aiClick(myLands[0]);
        } else {
          aiClick(items[Math.floor(Math.random() * items.length)]);
        }
      }
      return;
    }
  }

  // 6) 그 외 진행 버튼은 그냥 누른다
  aiClick(has("confirm-arrival") || has("quiz-result-to-arrival") || has("close-modal"));
}

function refreshContinueButton() {
  const btn = document.getElementById("btn-continue");
  if (btn) btn.disabled = !hasSavedGame();
}

/** 모달 안에서 쓰는 작은 말 아이콘 */
function pcMarkup(player) {
  return window.pieceMarkup ? pieceMarkup(playerPiece(player), "sm") : "";
}

/** 상금/벌금을 큰 원형 프로필 + 큰 색상 금액으로 보여주는 블록 */
function prizeRow(player, delta) {
  const gain = delta >= 0;
  const avatar = window.pieceMarkup ? pieceMarkup(playerPiece(player), "lg") : "";
  return `
    <div class="modal-prize ${gain ? "is-gain" : "is-loss"}">
      <span class="mp-avatar">${avatar}</span>
      <span class="mp-name">${escapeAttr(player.name)}</span>
      <span class="mp-amount">${gain ? "+" : "-"}${won(Math.abs(delta))}</span>
    </div>`;
}

function isModalOpen() {
  return !document.getElementById("modal-overlay").classList.contains("hidden");
}

function escapeAttr(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
