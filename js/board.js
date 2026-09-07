/**
 * board.js
 * 게임판 레이아웃(칸 배치)을 생성한다.
 * 국가를 추가/삭제해도(20개→50개→100개) 이 파일을 수정할 필요가 없다.
 * 정사각형 둘레의 네 모서리는 START + 쉼터 3칸으로 고정하고,
 * 나머지 둘레 칸에 국가를 순서대로 채우되, 국가 몇 개마다 찬스 칸을 하나씩 끼워 넣는다.
 *
 * 데이터에 국가가 BOARD_COUNTRY_TARGET보다 많으면 매 판 무작위로 골라 게임판에 올린다
 * (칸이 커지고, 판마다 여행지가 달라져 재미가 있다). 여행 도감에는 전체 국가가 다 나온다.
 */

const EVENT_EVERY = 7;             // 국가 N개마다 황금열쇠 칸 1개
const BOARD_COUNTRY_TARGET = 24;   // 한 판에 게임판에 올릴 국가 수(칸을 크게 하려고 줄임)

const CONTINENT_ORDER = ["아시아", "유럽", "북아메리카", "남아메리카", "아프리카", "오세아니아"];

function _shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 나라칸에 이름이 무난히 들어가는 길이 (한글 5자 이하). 더 길면 기본은 벤치로 */
const NAME_FITS = (c) => (c.nameKo || "").length <= 5;

/** 이번 판에 게임판에 올릴 국가 ID 목록을 고른다 (대륙 순서로 정렬해 반환) */
function pickBoardCountryIds(target = BOARD_COUNTRY_TARGET) {
  const all = getAllCountries();
  // 데이터가 target 이하면 전부 사용(정의 순서 유지), 많으면 무작위로 고름
  if (all.length <= target) return all.map((c) => c.id);
  // 이름이 짧아 칸에 잘 들어가는 나라를 먼저, 긴 이름은 뒤로 밀어 기본은 벤치로
  const pool = _shuffled(all).sort((a, b) => (NAME_FITS(a) ? 0 : 1) - (NAME_FITS(b) ? 0 : 1));
  const chosen = pool.slice(0, target);
  chosen.sort(
    (a, b) =>
      CONTINENT_ORDER.indexOf(a.continent) - CONTINENT_ORDER.indexOf(b.continent) ||
      a.nameKo.localeCompare(b.nameKo, "ko")
  );
  return chosen.map((c) => c.id);
}

/** side x side 정사각형의 둘레 좌표를 시계 방향으로 반환 (좌상단이 시작점) */
function getPerimeterCoords(side) {
  const coords = [];
  for (let c = 0; c < side; c++) coords.push({ row: 0, col: c });               // 윗줄 →
  for (let r = 1; r < side; r++) coords.push({ row: r, col: side - 1 });        // 오른쪽줄 ↓
  for (let c = side - 2; c >= 0; c--) coords.push({ row: side - 1, col: c });   // 아랫줄 ←
  for (let r = side - 2; r >= 1; r--) coords.push({ row: r, col: 0 });          // 왼쪽줄 ↑
  return coords;
}

/** 국가 + 찬스 칸이 섞인 "채울 순서" 목록 */
function buildFillSequence(countryIds, eventEvery) {
  const seq = [];
  countryIds.forEach((id, i) => {
    seq.push({ kind: "country", countryId: id });
    const isLast = i === countryIds.length - 1;
    if (!isLast && eventEvery > 0 && (i + 1) % eventEvery === 0) {
      seq.push({ kind: "event" });
    }
  });
  return seq;
}

/**
 * 게임판 칸 목록을 생성한다.
 * options.countryIds : 이번 판에 쓸 국가 ID 배열 (생략 시 매판 새로 고름 — 주의: 호출마다 달라짐)
 * 반환: { tiles, side }
 * tiles 각 원소: { index, type: "start"|"rest"|"country"|"event", row, col, countryId? }
 */
function buildBoardTiles(options = {}) {
  const eventEvery = options.eventEvery ?? EVENT_EVERY;
  const countryIds = options.countryIds || pickBoardCountryIds();
  const fillSeq = buildFillSequence(countryIds, eventEvery);

  // 둘레 칸 수 = 4*(side-1). 그 중 4칸은 모서리. non-corner = 4*side-8.
  const side = Math.max(4, Math.ceil((fillSeq.length + 8) / 4));
  const coords = getPerimeterCoords(side);
  const total = coords.length;
  const cornerIndexes = [0, side - 1, 2 * (side - 1), 3 * (side - 1)];

  const tiles = [];
  let seqCursor = 0;

  for (let i = 0; i < total; i++) {
    const { row, col } = coords[i];
    if (i === 0) {
      tiles.push({ index: i, type: "start", row, col });
    } else if (cornerIndexes.includes(i)) {
      tiles.push({ index: i, type: "rest", row, col });
    } else if (seqCursor < fillSeq.length) {
      const item = fillSeq[seqCursor++];
      if (item.kind === "country") {
        tiles.push({ index: i, type: "country", row, col, countryId: item.countryId });
      } else {
        tiles.push({ index: i, type: "event", row, col });
      }
    } else {
      tiles.push({ index: i, type: "rest", row, col });
    }
  }

  return { tiles, side };
}

/* ---------------------------------------------------------
   나라 바꾸기 (게임 중 설정에서 칸의 나라를 교체)
--------------------------------------------------------- */

/** 지금 게임판에 없는 나머지 나라 ID 목록 (도감 순서) */
function getBenchCountryIds(gameState) {
  const onBoard = new Set(gameState.boardCountryIds || []);
  return getAllCountries()
    .map((c) => c.id)
    .filter((id) => !onBoard.has(id));
}

/** oldId 칸의 나라를 newId로 교체. 이미 누가 산 나라이거나 조건이 안 맞으면 false */
function swapBoardCountry(gameState, oldId, newId) {
  if (!gameState || !Array.isArray(gameState.boardCountryIds)) return false;
  if (oldId === newId) return false;
  const idx = gameState.boardCountryIds.indexOf(oldId);
  if (idx === -1) return false;
  if (gameState.boardCountryIds.includes(newId)) return false;
  if (!getCountryById(newId)) return false;
  // 이미 구입된 나라는 못 바꾼다
  if (window.getCountryOwnerId && getCountryOwnerId(gameState, oldId) !== null) return false;
  gameState.boardCountryIds[idx] = newId;
  return true;
}

window.pickBoardCountryIds = pickBoardCountryIds;
window.buildBoardTiles = buildBoardTiles;
window.getBenchCountryIds = getBenchCountryIds;
window.swapBoardCountry = swapBoardCountry;
