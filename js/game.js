/**
 * game.js
 * 게임 진행 로직(상태 기계)을 담당한다.
 * DOM을 직접 건드리지 않는다 — 화면 렌더링은 ui.js가 담당한다.
 * 국가 데이터가 필요할 때는 반드시 country.js의 함수를 통해서만 참조한다.
 */

const DEFAULT_START_MONEY = 300; // 단위: 만원
const DEFAULT_MAX_TURNS = 24;
const PASS_START_BONUS = 46;     // 출발칸을 지날 때마다 받는 여행 자금 (만원)

const PLAYER_COLORS = ["#FF7A59", "#3DBBFF", "#4CC97C", "#FFC94D"];

/** 금액을 "300만원" 형태로 표시 */
function won(n) {
  return Math.round(n).toLocaleString("ko-KR") + "만원";
}
window.won = won;
window.PASS_START_BONUS = PASS_START_BONUS;

const BANKRUPTCY_TURN_CAP = 60; // 파산 모드에서 무한 방지용 최대 턴

/** 새 게임 상태를 생성한다. playerConfigs: [{name, character}] */
function createInitialGameState(playerConfigs, settings = {}) {
  const startMoney = settings.startMoney ?? DEFAULT_START_MONEY;
  const endMode = settings.endMode === "bankruptcy" ? "bankruptcy" : "turns";
  const maxTurns = endMode === "bankruptcy" ? BANKRUPTCY_TURN_CAP : settings.maxTurns ?? DEFAULT_MAX_TURNS;

  const players = playerConfigs.map((cfg, i) => {
    const piece = window.getPieceById ? window.getPieceById(cfg.pieceId) : null;
    const color = (piece && piece.color) || PLAYER_COLORS[i % PLAYER_COLORS.length];
    return createPlayer(i, cfg.name, cfg.pieceId, color, startMoney, cfg.isAI);
  });

  const boardCountryIds = pickBoardCountryIds();
  const { tiles } = buildBoardTiles({ countryIds: boardCountryIds });

  return {
    status: "playing",       // "playing" | "ended"
    players,
    currentPlayerIndex: 0,
    turn: 1,
    maxTurns,
    endMode,                  // "turns" | "bankruptcy"
    boardLength: tiles.length,
    boardCountryIds,          // 이번 판 게임판에 올린 국가 (이어하기 시 동일 배치 재현)
    countryOwners: {},        // countryId -> playerId
    visitedCountries: {},     // playerId -> [countryId, ...]
    settings: { startMoney, maxTurns, endMode },
    isMoving: false,          // 이동/애니메이션 중 다른 조작 방지 플래그
  };
}

function getCurrentPlayer(gameState) {
  return gameState.players[gameState.currentPlayerIndex];
}

function activePlayers(gameState) {
  return gameState.players.filter((p) => !p.isBankrupt);
}

/** 국가 방문 기록 (여행 도감 기초 데이터, STEP11에서 화면 연결 예정) */
function recordVisit(gameState, playerId, countryId) {
  if (!gameState.visitedCountries[playerId]) {
    gameState.visitedCountries[playerId] = [];
  }
  if (!gameState.visitedCountries[playerId].includes(countryId)) {
    gameState.visitedCountries[playerId].push(countryId);
  }
}

/** 다음 (파산하지 않은) 플레이어로 턴을 넘긴다 */
function advanceTurn(gameState) {
  // 파산 모드: 살아있는 사람이 1명 이하면 종료
  if (gameState.endMode === "bankruptcy" && activePlayers(gameState).length <= 1) {
    gameState.status = "ended";
    return;
  }

  const n = gameState.players.length;
  let idx = gameState.currentPlayerIndex;
  for (let step = 0; step < n; step++) {
    idx = (idx + 1) % n;
    if (idx === 0) gameState.turn += 1;
    if (!gameState.players[idx].isBankrupt) break;
  }
  gameState.currentPlayerIndex = idx;

  if (gameState.turn > gameState.maxTurns) {
    gameState.status = "ended";
  }
  if (gameState.endMode === "bankruptcy" && activePlayers(gameState).length <= 1) {
    gameState.status = "ended";
  }
}

/** 게임 결과를 순위대로 계산한다 (파산자는 맨 뒤) */
function computeFinalResults(gameState) {
  return [...gameState.players]
    .map((p) => ({
      player: p,
      cash: p.money,
      countryCount: p.ownedCountries.length,
      netWorth: p.isBankrupt ? -1 : getPlayerNetWorth(p),
      bankrupt: !!p.isBankrupt,
    }))
    .sort((a, b) => b.netWorth - a.netWorth);
}

window.createInitialGameState = createInitialGameState;
window.getCurrentPlayer = getCurrentPlayer;
window.activePlayers = activePlayers;
window.recordVisit = recordVisit;
window.advanceTurn = advanceTurn;
window.computeFinalResults = computeFinalResults;
