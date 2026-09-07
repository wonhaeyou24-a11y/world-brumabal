/**
 * board.js
 * 게임판 레이아웃(칸 배치)을 생성한다.
 * 국가를 추가/삭제해도(20개→50개→100개) 이 파일을 수정할 필요가 없다.
 * 정사각형 둘레의 네 모서리는 START + 쉼터 3칸으로 고정하고,
 * 나머지 둘레 칸에 countries.js의 국가를 순서대로 채우되,
 * 국가 몇 개마다 이벤트 칸(EVENT_EVERY)을 하나씩 끼워 넣는다.
 */

const EVENT_EVERY = 4; // 국가 N개마다 이벤트 칸 1개

/** side x side 정사각형의 둘레 좌표를 시계 방향으로 반환 (좌상단이 시작점) */
function getPerimeterCoords(side) {
  const coords = [];
  for (let c = 0; c < side; c++) coords.push({ row: 0, col: c });               // 윗줄 →
  for (let r = 1; r < side; r++) coords.push({ row: r, col: side - 1 });        // 오른쪽줄 ↓
  for (let c = side - 2; c >= 0; c--) coords.push({ row: side - 1, col: c });   // 아랫줄 ←
  for (let r = side - 2; r >= 1; r--) coords.push({ row: r, col: 0 });          // 왼쪽줄 ↑
  return coords;
}

/**
 * 국가 + 이벤트 칸이 섞인 "채울 순서" 목록을 만든다.
 * 반환: [{ kind: "country", countryId } | { kind: "event" }, ...]
 */
function buildFillSequence(countries, eventEvery) {
  const seq = [];
  countries.forEach((country, i) => {
    seq.push({ kind: "country", countryId: country.id });
    const isLast = i === countries.length - 1;
    if (!isLast && eventEvery > 0 && (i + 1) % eventEvery === 0) {
      seq.push({ kind: "event" });
    }
  });
  return seq;
}

/**
 * 게임판 칸 목록을 생성한다.
 * 반환 배열의 각 원소: { index, type, row, col, countryId? }
 * type: "start" | "rest" | "country" | "event"
 */
function buildBoardTiles(options = {}) {
  const eventEvery = options.eventEvery ?? EVENT_EVERY;
  const countries = getAllCountries();
  const fillSeq = buildFillSequence(countries, eventEvery);

  // 둘레 칸 수 = 4*(side-1). 그 중 4칸은 모서리(출발+쉼터3)이므로
  // 채울 수 있는 칸 수(non-corner) = 4*(side-1)-4 = 4*side-8.
  // 이 값이 fillSeq 길이 이상이 되는 최소 side를 구한다.
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
      // 남는 둘레 칸은 쉼터로 채운다 (국가 수가 적을 때 자동 대응)
      tiles.push({ index: i, type: "rest", row, col });
    }
  }

  return { tiles, side };
}

window.buildBoardTiles = buildBoardTiles;
