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

/** 새 게임 상태를 생성한다. playerConfigs: [{name, character}] */
function createInitialGameState(playerConfigs, settings = {}) {
  const startMoney = settings.startMoney ?? DEFAULT_START_MONEY;
  const maxTurns = settings.maxTurns ?? DEFAULT_MAX_TURNS;

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
    boardLength: tiles.length,
    boardCountryIds,          // 이번 판 게임판에 올린 국가 (이어하기 시 동일 배치 재현)
    countryOwners: {},        // countryId -> playerId
    visitedCountries: {},     // playerId -> [countryId, ...]
    settings: { startMoney, maxTurns },
    isMoving: false,          // 이동/애니메이션 중 다른 조작 방지 플래그
  };
}

function getCurrentPlayer(gameState) {
  return gameState.players[gameState.currentPlayerIndex];
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

/** 다음 플레이어로 턴을 넘긴다. 한 바퀴(모든 플레이어 진행)가 끝나면 turn 증가 */
function advanceTurn(gameState) {
  const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  if (nextIndex === 0) {
    gameState.turn += 1;
  }
  gameState.currentPlayerIndex = nextIndex;

  if (gameState.turn > gameState.maxTurns) {
    gameState.status = "ended";
  }
}

/** 게임 결과를 순위대로 계산한다 */
function computeFinalResults(gameState) {
  return [...gameState.players]
    .map((p) => ({
      player: p,
      cash: p.money,
      countryCount: p.ownedCountries.length,
      netWorth: getPlayerNetWorth(p),
    }))
    .sort((a, b) => b.netWorth - a.netWorth);
}

window.createInitialGameState = createInitialGameState;
window.getCurrentPlayer = getCurrentPlayer;
window.recordVisit = recordVisit;
window.advanceTurn = advanceTurn;
window.computeFinalResults = computeFinalResults;
