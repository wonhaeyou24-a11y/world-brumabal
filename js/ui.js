/**
 * ui.js
 * 화면 렌더링과 DOM 이벤트 처리를 전담한다.
 * 게임 규칙 계산은 하지 않고, game.js / property.js / dice.js의 결과를 화면에 반영만 한다.
 */


/* ---------------------------------------------------------
   화면 전환
--------------------------------------------------------- */
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

/* ---------------------------------------------------------
   모달
--------------------------------------------------------- */
function showModal(innerHTML, opts = {}) {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");
  content.innerHTML = innerHTML;
  // 화면 아무 곳이나 터치하면 넘어가는 모달(통행료 등)
  overlay.classList.toggle("modal--tap", !!opts.tapAnywhere);
  overlay.classList.remove("hidden");
}
function hideModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("hidden");
  overlay.classList.remove("modal--tap");
}

/* ---------------------------------------------------------
   설정 화면 - 플레이어 입력 폼 (말 고르기)
--------------------------------------------------------- */
const DEFAULT_NAMES = ["시우", "아빠", "엄마", "친구"];
let setupPieceAssign = []; // 플레이어별 선택한 말 ID
let setupAIAssign = [];    // 플레이어별 AI 여부

function renderSetupForm(count) {
  const wrap = document.getElementById("player-form-list");
  const pieces = window.PIECES || [];

  // 말 배정 초기화/유지 (기본: 말1=시우 … 순서대로, 중복 없이)
  if (setupPieceAssign.length !== count) {
    setupPieceAssign = Array.from({ length: count }, (_, i) => (pieces[i % pieces.length] || {}).id);
  }
  if (setupAIAssign.length !== count) {
    setupAIAssign = Array.from({ length: count }, () => false);
  }

  wrap.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const row = document.createElement("div");
    row.className = "player-form-row";
    row.dataset.index = i;
    row.innerHTML = `
      <div class="pf-head">
        <input data-role="name" data-index="${i}" type="text" maxlength="8"
               placeholder="플레이어 ${i + 1}" value="${escapeHtml(
                 setupAIAssign[i] ? `AI ${i + 1}` : DEFAULT_NAMES[i] || "플레이어 " + (i + 1)
               )}" />
        <button type="button" class="ai-toggle ${setupAIAssign[i] ? "is-on" : ""}" data-role="ai" data-index="${i}"
                aria-pressed="${setupAIAssign[i] ? "true" : "false"}" title="AI가 대신 플레이">
          <span class="ai-toggle-face">🤖</span><span class="ai-toggle-text">AI</span>
        </button>
      </div>
      <div class="piece-pick" data-index="${i}">
        ${pieces
          .map(
            (pc) => `
          <button type="button" class="piece-opt ${setupPieceAssign[i] === pc.id ? "is-selected" : ""}"
                  data-piece="${pc.id}" data-index="${i}" style="--piece-color:${pc.color}">
            ${pieceMarkup(pc, "md")}
            <span class="piece-opt-label">${pc.label}</span>
          </button>`
          )
          .join("")}
      </div>
    `;
    wrap.appendChild(row);
  }

  wrap.querySelectorAll(".piece-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.index);
      const pieceId = btn.dataset.piece;
      if (setupPieceAssign[i] === pieceId) return;
      // 다른 플레이어가 그 말을 쓰고 있으면 서로 맞바꾼다 (중복 방지)
      const j = setupPieceAssign.indexOf(pieceId);
      if (j !== -1) setupPieceAssign[j] = setupPieceAssign[i];
      setupPieceAssign[i] = pieceId;
      renderSetupForm(count); // 다시 그려 선택 상태 반영
    });
  });

  wrap.querySelectorAll(".ai-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.index);
      const on = btn.getAttribute("aria-pressed") !== "true";
      setupAIAssign[i] = on;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-on", on);
      const input = btn.closest(".player-form-row").querySelector('input[data-role="name"]');
      input.value = on ? `AI ${i + 1}` : DEFAULT_NAMES[i] || `플레이어 ${i + 1}`;
    });
  });
}

function resetSetupAssignments() {
  setupPieceAssign = [];
  setupAIAssign = [];
}

function readSetupPlayerConfigs() {
  const names = Array.from(document.querySelectorAll('input[data-role="name"]'));
  const ais = Array.from(document.querySelectorAll('.ai-toggle[data-role="ai"]'));
  const pieces = window.PIECES || [];
  return names.map((input, i) => ({
    name: input.value.trim() || `플레이어 ${i + 1}`,
    pieceId: setupPieceAssign[i] || (pieces[i % pieces.length] || {}).id,
    isAI: ais[i] ? ais[i].getAttribute("aria-pressed") === "true" : false,
  }));
}

/* ---------------------------------------------------------
   게임판 렌더링
--------------------------------------------------------- */
let currentBoardTiles = [];
let currentBoardSide = 0;

function buildBoardDOMOnce(gameState) {
  const { tiles, side } = buildBoardTiles({
    countryIds: gameState && gameState.boardCountryIds,
  });
  currentBoardTiles = tiles;
  currentBoardSide = side;

  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${side}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${side}, 1fr)`;

  // 중앙 로고 영역
  const center = document.createElement("div");
  center.className = "board-center";
  center.innerHTML = `
    <div class="center-globe">🌎</div>
    <div class="center-title">세계여행</div>
    <div class="center-turn" id="center-turn-text"></div>
  `;
  boardEl.appendChild(center);

  tiles.forEach((tile) => {
    const tileEl = document.createElement("div");
    tileEl.dataset.index = tile.index;
    tileEl.style.gridRow = tile.row + 1;
    tileEl.style.gridColumn = tile.col + 1;

    // 게임판 어느 가장자리에 있는 칸인지 (주인 표시를 바깥 여백으로 빼기 위함)
    const edge =
      tile.row === 0 ? "top" : tile.row === side - 1 ? "bottom" : tile.col === 0 ? "left" : "right";
    tileEl.dataset.edge = edge;

    if (tile.type === "start") {
      tileEl.className = "tile tile--start";
      tileEl.innerHTML = `<div class="tile-icon">🚩</div><div class="tile-name">출발</div>`;
    } else if (tile.type === "rest") {
      tileEl.className = "tile tile--rest";
      tileEl.innerHTML = `<div class="tile-icon">🍔</div><div class="tile-name">쉼터</div>`;
    } else if (tile.type === "event") {
      tileEl.className = "tile tile--event";
      tileEl.innerHTML = `<div class="tile-icon">🗝️</div><div class="tile-name">황금열쇠</div>`;
    } else {
      const c = getCountryById(tile.countryId);
      tileEl.className = "tile tile--country";
      tileEl.innerHTML = `
        <div class="tile-flag">${flagMarkup(c)}</div>
        <div class="tile-name">${c.nameKo}</div>
        <div class="tile-capital">${c.capitalKo}</div>
        <div class="tile-owner-bar" data-owner-bar></div>
      `;
    }

    const tokens = document.createElement("div");
    tokens.className = "tile-tokens";
    tokens.dataset.tokens = "";
    tileEl.appendChild(tokens);

    boardEl.appendChild(tileEl);
  });
}

/**
 * 소유권 표시, 플레이어 말 위치, 현재 턴 강조 등 동적인 부분만 갱신.
 * opts.hopPlayerId : 이 플레이어의 말에 "깡총" 애니메이션을 준다 (이동 중 한 칸씩)
 * opts.landed      : true면 도착 칸을 "쿵" 강조한다
 */
function renderBoardDynamic(gameState, opts = {}) {
  // 소유권 색 표시
  currentBoardTiles.forEach((tile) => {
    if (tile.type !== "country") return;
    const tileEl = document.querySelector(`.tile[data-index="${tile.index}"]`);
    const bar = tileEl.querySelector("[data-owner-bar]");
    const ownerId = getCountryOwnerId(gameState, tile.countryId);
    if (ownerId === null) {
      bar.innerHTML = "";
      tileEl.style.removeProperty("--owner-color");
      tileEl.classList.remove("tile--owned");
    } else {
      const owner = gameState.players.find((p) => p.id === ownerId);
      bar.innerHTML = `<span class="tile-owner-piece">${pieceMarkup(playerPiece(owner), "sm")}</span>`;
      tileEl.style.setProperty("--owner-color", owner.color);
      tileEl.classList.add("tile--owned");
    }
  });

  // 말 위치 표시
  const current = getCurrentPlayer(gameState);
  document.querySelectorAll("[data-tokens]").forEach((el) => (el.innerHTML = ""));
  gameState.players.forEach((p) => {
    if (p.isBankrupt) return; // 파산한 플레이어의 말은 보이지 않음
    const tile = currentBoardTiles[p.position % currentBoardTiles.length];
    const tileEl = document.querySelector(`.tile[data-index="${tile.index}"]`);
    if (!tileEl) return;
    const tokenWrap = tileEl.querySelector("[data-tokens]");
    const span = document.createElement("span");
    span.className = "tile-token" + (p.id === current.id ? " is-current" : "");
    span.style.setProperty("--tok-color", p.color);
    span.dataset.playerId = p.id;
    span.innerHTML =
      `<span class="token-head">${pieceMarkup(playerPiece(p), "sm")}</span>` +
      `<span class="token-body"><i class="token-leg"></i><i class="token-leg"></i></span>`;
    if (p.id === opts.hopPlayerId) span.classList.add("tile-token--walk");
    tokenWrap.appendChild(span);
  });

  // 현재 플레이어가 서 있는 칸 강조
  document.querySelectorAll(".tile--current-player").forEach((el) => el.classList.remove("tile--current-player"));
  const curTile = currentBoardTiles[current.position % currentBoardTiles.length];
  const curTileEl = document.querySelector(`.tile[data-index="${curTile.index}"]`);
  if (curTileEl) {
    curTileEl.classList.add("tile--current-player");
    if (opts.landed) {
      curTileEl.classList.remove("tile--landing");
      void curTileEl.offsetWidth; // 리플로우 강제 → 애니메이션 재시작
      curTileEl.classList.add("tile--landing");
    }
  }

  const centerTurnText = document.getElementById("center-turn-text");
  if (centerTurnText) centerTurnText.textContent = `${gameState.turn} / ${gameState.maxTurns}턴`;
}

/* ---------------------------------------------------------
   플레이어 패널 / 상단바
--------------------------------------------------------- */
function ownedFolderHTML(player) {
  const owned = player.ownedCountries
    .map((id) => getCountryById(id))
    .filter(Boolean);
  if (owned.length === 0) {
    return `<div class="owned-folder is-empty"><div class="owned-empty">아직 산 나라가 없어요</div></div>`;
  }
  const tabs = owned
    .map(
      (c) => `
      <button type="button" class="owned-tab" data-country-id="${c.id}" title="${escapeHtml(c.nameKo)} 카드 보기">
        <span class="owned-flag">${flagMarkup(c)}</span>
        <span class="owned-name">${escapeHtml(c.nameKo)}</span>
      </button>`
    )
    .join("");
  return `<div class="owned-folder">${tabs}</div>`;
}

function renderPlayerPanel(gameState) {
  const panel = document.getElementById("player-panel");
  panel.innerHTML = gameState.players
    .map((p, i) => {
      const isCurrent = i === gameState.currentPlayerIndex && !p.isBankrupt;
      const count = p.ownedCountries.length;
      const status = p.isBankrupt ? "💀 파산" : isCurrent ? "내 차례!" : "여행 중";
      return `
        <div class="player-card ${isCurrent ? "is-current" : ""} ${p.isBankrupt ? "is-bankrupt" : ""}"
             data-player-id="${p.id}" style="--chip-color:${p.color}">
          <div class="pc-main">
            <span class="pc-avatar">
              ${pieceMarkup(playerPiece(p), "lg")}
              <span class="pc-avatar-name">${escapeHtml(p.name)}${p.isAI ? " 🤖" : ""}</span>
            </span>
            <div class="pc-body">
              <div class="pc-tags">
                <span>🚩 ${count}</span><span>🏨 0</span><span>🏝️ 0</span>
              </div>
              <div class="pc-money">💰 ${won(p.money)}</div>
              <div class="pc-sub">
                <span>🎴 스페셜 0</span>
                <span class="pc-status ${isCurrent ? "on" : ""} ${p.isBankrupt ? "bankrupt" : ""}">${status}</span>
              </div>
            </div>
          </div>
          ${
            p.isBankrupt
              ? ""
              : `<div class="pc-owned-label">보유 나라 ${count}개</div>${ownedFolderHTML(p)}`
          }
        </div>
      `;
    })
    .join("");
}

/** 플레이어 카드 위에 +46만원 / -12만원 같은 뱃지를 잠깐 띄운다 */
function flashMoney(playerId, delta) {
  if (!delta) return;
  const card = document.querySelector(`.player-card[data-player-id="${playerId}"]`);
  if (!card) return;
  const badge = document.createElement("span");
  badge.className = "money-flash " + (delta >= 0 ? "gain" : "loss");
  badge.textContent = `${delta >= 0 ? "+" : "-"}${won(Math.abs(delta))}`;
  card.appendChild(badge);
  setTimeout(() => badge.remove(), 1200);
}

function renderTopbar(gameState) {
  const current = getCurrentPlayer(gameState);
  const tag = current.isAI ? " 🤖" : "";
  document.getElementById("turn-indicator").innerHTML =
    `${pieceMarkup(playerPiece(current), "md")}<span class="turn-name">${escapeHtml(current.name)}의 차례!${tag}</span>`;
  document.getElementById("turn-counter").textContent = `${gameState.turn} / ${gameState.maxTurns}턴`;
}

function renderGameScreen(gameState) {
  renderTopbar(gameState);
  renderPlayerPanel(gameState);
  renderBoardDynamic(gameState);
}

/* ---------------------------------------------------------
   결과 화면
--------------------------------------------------------- */
function renderResultScreen(gameState) {
  const results = computeFinalResults(gameState);
  const medal = ["🥇", "🥈", "🥉", "4️⃣"];
  const list = document.getElementById("result-list");
  list.innerHTML = results
    .map(
      (r, i) => `
      <div class="result-row ${i === 0 && !r.bankrupt ? "is-winner" : ""} ${r.bankrupt ? "is-bankrupt" : ""}">
        <div class="result-rank">${r.bankrupt ? "💀" : medal[i] || i + 1}</div>
        <span class="result-piece">${pieceMarkup(playerPiece(r.player), "lg")}</span>
        <div style="flex:1">
          <div class="result-name">${escapeHtml(r.player.name)}</div>
          <div class="result-detail">${r.bankrupt ? "파산" : `보유 국가 ${r.countryCount}개 · 현금 ${won(r.cash)}`}</div>
        </div>
        <div class="result-detail" style="font-weight:bold;color:var(--sky-deep)">${r.bankrupt ? "" : "총 " + won(r.netWorth)}</div>
      </div>
    `
    )
    .join("");
}

/* ---------------------------------------------------------
   여행 도감 화면
--------------------------------------------------------- */
function collectVisitedIds(gameState) {
  const log = loadTravelLog();
  const visited = new Set(Object.keys(log));
  if (gameState && gameState.visitedCountries) {
    Object.values(gameState.visitedCountries).forEach((list) =>
      list.forEach((id) => visited.add(id))
    );
  }
  return { visited, log };
}

function renderCollectionScreen(gameState) {
  const { visited, log } = collectVisitedIds(gameState);
  const all = getAllCountries();
  const count = all.filter((c) => visited.has(c.id)).length;

  document.getElementById("collection-progress").textContent =
    `${all.length}개 나라 중 ${count}개 방문!`;

  const grid = document.getElementById("collection-grid");
  grid.innerHTML = all
    .map((c) => {
      if (!visited.has(c.id)) {
        return `
          <div class="collection-card is-locked">
            <div class="collection-photo">❓</div>
            <div class="collection-name">???</div>
            <div class="collection-capital">아직 안 가봤어요</div>
          </div>`;
      }
      const times = log[c.id] ? ` · ${log[c.id]}번 방문` : "";
      return `
        <div class="collection-card is-visited">
          <div class="collection-photo">${landmarkImgHTML(c)}</div>
          <div class="collection-name">${flagMarkup(c, "flag--inline")} ${escapeHtml(c.nameKo)}</div>
          <div class="collection-capital">🏙️ ${escapeHtml(c.capitalKo)} · ${escapeHtml(c.landmarkKo)}</div>
          <div class="collection-meta">${escapeHtml(c.continent)}${times}</div>
        </div>`;
    })
    .join("");
}

/* ---------------------------------------------------------
   나라 카드 (도착·통행료·소유 모달에서 공통 사용) — 랜드마크 사진 포함
--------------------------------------------------------- */
function landmarkImgHTML(country, extraClass) {
  return `<span class="landmark ${extraClass || ""}">
    <img class="landmark-photo" src="${country.landmarkImg}" alt="${escapeHtml(country.landmarkKo)}"
         onerror="this.classList.add('is-missing')" />
    <span class="landmark-flag">${flagMarkup(country)}</span>
  </span>`;
}

/** 국기 이미지(SVG). 파일이 없으면 이모지로 대체 */
function flagMarkup(country, extraClass) {
  return `<span class="flag ${extraClass || ""}">
    <img class="flag-img" src="assets/flags/${country.id}.svg" alt="${escapeHtml(country.nameKo)} 국기"
         onerror="this.classList.add('is-missing')" />
    <span class="flag-emoji">${country.flag}</span>
  </span>`;
}

/**
 * opts: { travelerName, ownerName, myMoney, price, rent, priceLabelHTML }
 */
function buildCountryCard(country, opts = {}) {
  const rows = [];
  rows.push(["🏙️ 도시", country.capitalKo]);
  rows.push(["🌍 대륙", country.continent]);
  if ("ownerName" in opts) rows.push(["👑 소유자", opts.ownerName || "--"]);
  if ("myMoney" in opts) rows.push(["💰 나의 자금", won(opts.myMoney), "money"]);
  if ("price" in opts) rows.push(["🏷️ 가격", opts.priceLabelHTML || won(opts.price), "raw"]);
  if ("rent" in opts) rows.push(["🚉 통행료", won(opts.rent)]);

  const rowsHTML = rows
    .map(([k, v, cls]) => {
      const val = cls === "raw" ? v : escapeHtml(String(v));
      return `<div class="cc-row"><span class="cc-k">${k}</span><span class="cc-v ${cls || ""}">${val}</span></div>`;
    })
    .join("");

  return `
    <div class="cc-head">
      <div class="cc-title">${flagMarkup(country, "flag--title")} [${escapeHtml(country.nameKo)}] ${escapeHtml(country.landmarkKo)}</div>
      ${opts.travelerName ? `<div class="cc-traveler">현재 여행자: ${escapeHtml(opts.travelerName)}</div>` : ""}
    </div>
    <div class="cc-body">
      ${landmarkImgHTML(country, "landmark--card")}
      <div class="cc-rows">${rowsHTML}</div>
    </div>`;
}

/* ---------------------------------------------------------
   임팩트 연출 (국가 구입 / 통행료)
--------------------------------------------------------- */
function showFxBurst(kind, opts = {}) {
  const layer = document.getElementById("fx-layer");
  const done = () => {
    if (layer) {
      layer.classList.add("hidden");
      layer.innerHTML = "";
      layer.className = "fx-layer hidden";
    }
    if (opts.onDone) opts.onDone();
  };
  if (!layer) return done();

  const reduced = window.prefersReducedAnim && window.prefersReducedAnim();
  layer.className = "fx-layer fx-" + kind;
  const text = escapeHtml(opts.text || (kind === "buy" ? "구입!" : "통행료!"));

  if (kind === "buy") {
    const confetti = Array.from({ length: 18 }, (_, i) => {
      const colors = ["#FF7A59", "#3DBBFF", "#4CC97C", "#FFC94D", "#ff5fa2"];
      return `<i style="--c:${colors[i % 5]};--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * 0.3).toFixed(2)}s;--r:${(Math.random() * 360).toFixed(0)}deg"></i>`;
    }).join("");
    layer.innerHTML = `<div class="fx-ring"></div><div class="fx-emoji">🎉</div><div class="fx-text">${text}</div><div class="fx-confetti">${confetti}</div>`;
  } else {
    // 통행료: 요란한 경보 연출 (재미 포인트!)
    const coins = Array.from({ length: 16 }, () => {
      return `<i style="--x:${(Math.random() * 100).toFixed(0)}%;--d:${(Math.random() * 0.4).toFixed(2)}s;--s:${(0.6 + Math.random() * 1).toFixed(2)}"></i>`;
    }).join("");
    layer.innerHTML =
      `<div class="fx-siren"></div>` +
      `<div class="fx-flash"></div>` +
      `<div class="fx-emoji fx-emoji--rent">💸</div>` +
      `<div class="fx-text">${text}</div>` +
      `<div class="fx-coindrop">${coins}</div>`;
  }
  layer.classList.remove("hidden");
  setTimeout(done, reduced ? 250 : kind === "buy" ? 1150 : 1450);
}

/* ---------------------------------------------------------
   퀴즈 모달 HTML (보기 버튼은 data-choice-index 로 식별)
--------------------------------------------------------- */
function buildQuizModalHTML(quiz, subtitle) {
  const country =
    quiz && quiz.countryId && window.getCountryById ? getCountryById(quiz.countryId) : null;
  const flagHTML = country
    ? `<div class="quiz-flag ${quiz.type === "flag" ? "quiz-flag--big" : ""}">${flagMarkup(country, "flag--quiz")}</div>`
    : "";
  return `
    ${flagHTML}
    <h3 class="modal-title">${escapeHtml(quiz.prompt)}</h3>
    ${subtitle ? `<p class="modal-message" style="font-size:0.9rem;opacity:0.75">${escapeHtml(subtitle)}</p>` : ""}
    <div class="quiz-choices">
      ${quiz.choices
        .map(
          (choice, i) =>
            `<button class="btn btn-secondary quiz-choice" data-action="quiz-answer" data-choice-index="${i}">${escapeHtml(choice)}</button>`
        )
        .join("")}
    </div>`;
}

/* ---------------------------------------------------------
   유틸
--------------------------------------------------------- */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

window.showScreen = showScreen;
window.showModal = showModal;
window.hideModal = hideModal;
window.renderSetupForm = renderSetupForm;
window.readSetupPlayerConfigs = readSetupPlayerConfigs;
window.resetSetupAssignments = resetSetupAssignments;
window.buildBoardDOMOnce = buildBoardDOMOnce;
window.renderBoardDynamic = renderBoardDynamic;
window.renderGameScreen = renderGameScreen;
window.renderPlayerPanel = renderPlayerPanel;
window.renderResultScreen = renderResultScreen;
window.renderCollectionScreen = renderCollectionScreen;
window.buildQuizModalHTML = buildQuizModalHTML;
window.buildCountryCard = buildCountryCard;
window.landmarkImgHTML = landmarkImgHTML;
window.flagMarkup = flagMarkup;
window.showFxBurst = showFxBurst;
window.flashMoney = flashMoney;
window.getBoardTiles = () => currentBoardTiles;
