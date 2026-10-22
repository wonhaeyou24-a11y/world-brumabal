/**
 * event.js
 * 이벤트 칸 도착 시 이벤트 카드를 뽑고, 그 효과를 게임 상태에 적용한다.
 * DOM을 건드리지 않는다 — 카드 내용을 화면에 보여주는 것은 main.js/ui.js가 한다.
 *
 * 지원 카드 유형:
 *   "bonus"        : 여행 자금 지급
 *   "cost"         : 지출 (일부 복지기금 환원 가능)
 *   "quiz"         : 세계 지리 & 수도 퀴즈
 *   "travel"       : 무작위 국가 여행
 *   "free_upgrade" : 내 나라 1곳 무료 건물 업그레이드 (없으면 지원금 20만)
 *   "toll_shield"  : 통행료 1회 면제 우대권 획득 (소지형 아이템)
 *   "welfare_gift" : 복지기금 특별 장학금 지원
 *   "jump"         : 앞/뒤 즉시 점프 이동
 *   "go_airport"   : 공항(세계여행) 직행 및 비행 대기
 */

/** weight를 반영해 이벤트 카드 하나를 무작위로 뽑는다 */
function drawEventCard() {
  const cards = window.EVENT_CARDS || [];
  if (cards.length === 0) return null;
  const totalWeight = cards.reduce((sum, c) => sum + (c.weight ?? 1), 0);
  let roll = Math.random() * totalWeight;
  for (const card of cards) {
    roll -= card.weight ?? 1;
    if (roll <= 0) return card;
  }
  return cards[cards.length - 1];
}

/**
 * bonus / cost 카드를 즉시 적용한다.
 * 반환: { type, delta, playerMoney }  (delta: 돈 변화량, +면 받음 / -면 냄)
 */
function applyMoneyEvent(player, card) {
  if (card.type === "bonus") {
    player.money += card.amount;
    return { type: "bonus", delta: card.amount, playerMoney: player.money };
  }
  if (card.type === "cost") {
    const paid = Math.min(card.amount, Math.max(player.money, 0));
    player.money -= paid;
    return { type: "cost", delta: -paid, playerMoney: player.money };
  }
  return null;
}

/** 퀴즈 이벤트 정답 보상 지급 */
function applyQuizReward(player) {
  const reward = window.QUIZ_CONFIG?.eventReward ?? 100;
  player.money += reward;
  return { reward, playerMoney: player.money };
}

/**
 * 여행 이벤트: 현재 위치를 제외한 무작위 국가 칸으로 이동시킨다.
 * 반환: { countryId, newPosition }  (국가 칸이 없으면 null)
 */
function applyTravelEvent(gameState, player, boardTiles) {
  const countryTiles = boardTiles.filter(
    (t) => t.type === "country" && t.index !== player.position
  );
  if (countryTiles.length === 0) return null;
  const dest = countryTiles[Math.floor(Math.random() * countryTiles.length)];
  player.position = dest.index;
  return { countryId: dest.countryId, newPosition: dest.index };
}

/**
 * 무료 건축 지원권: 플레이어가 가진 나라 중 랜드마크 미만인 곳을 1단계 무료로 올려준다.
 * 소유한 나라가 없거나 이미 전부 랜드마크라면 지원금 20만 원 지급!
 */
function applyFreeUpgrade(gameState, player) {
  const maxLv = window.BUILDING_MAX_LEVEL ?? 4;
  const upgradeable = (player.ownedCountries || []).filter((id) => {
    const lv = window.getBuildingLevel ? window.getBuildingLevel(gameState, id) : 0;
    return lv < maxLv;
  });

  if (upgradeable.length === 0) {
    const fallbackBonus = 20;
    player.money += fallbackBonus;
    return {
      type: "free_upgrade",
      success: false,
      fallbackBonus,
      playerMoney: player.money,
    };
  }

  // 가격이 가장 높은 나라를 우선 업그레이드
  upgradeable.sort((a, b) => {
    const ca = window.getCountryById ? window.getCountryById(a) : null;
    const cb = window.getCountryById ? window.getCountryById(b) : null;
    return (cb?.price ?? 0) - (ca?.price ?? 0);
  });

  const targetId = upgradeable[0];
  const curLv = window.getBuildingLevel ? window.getBuildingLevel(gameState, targetId) : 0;
  const nextLv = curLv + 1;
  if (!gameState.buildings) gameState.buildings = {};
  gameState.buildings[targetId] = nextLv;

  const country = window.getCountryById ? window.getCountryById(targetId) : null;
  const stages = window.BUILDING_STAGES || [];
  const stage = stages[nextLv];

  return {
    type: "free_upgrade",
    success: true,
    countryId: targetId,
    countryName: country ? country.nameKo : targetId,
    level: nextLv,
    stage,
  };
}

/** 통행료 면제 우대권 획득 (소지 개수 +1) */
function applyTollShield(player) {
  player.tollShield = (player.tollShield || 0) + 1;
  return { count: player.tollShield };
}

/** 복지기금 특별 장학금 지급 */
function applyWelfareGift(gameState, player, amount = 20) {
  const amt = Math.max(10, Number(amount) || 20);
  player.money += amt;
  if (gameState.welfareFund && gameState.welfareFund > 20) {
    gameState.welfareFund = Math.max(20, gameState.welfareFund - amt);
  }
  return { amount: amt, playerMoney: player.money };
}

/** 즉시 점프 이동 (+앞으로 / -뒤로) */
function applyJumpEvent(gameState, player, steps, boardTiles) {
  const len = boardTiles.length;
  const oldPos = player.position;
  player.position = (player.position + steps + len) % len;
  return { oldPos, steps, newPosition: player.position };
}

/** 세계여행(공항) 칸으로 즉시 이동 및 비행 준비 */
function applyGoAirport(gameState, player, boardTiles) {
  const airportTile = boardTiles.find((t) => t.type === "travel");
  if (!airportTile) return null;
  player.position = airportTile.index;
  player.pendingFly = true;
  return { newPosition: airportTile.index };
}

window.drawEventCard = drawEventCard;
window.applyMoneyEvent = applyMoneyEvent;
window.applyQuizReward = applyQuizReward;
window.applyTravelEvent = applyTravelEvent;
window.applyFreeUpgrade = applyFreeUpgrade;
window.applyTollShield = applyTollShield;
window.applyWelfareGift = applyWelfareGift;
window.applyJumpEvent = applyJumpEvent;
window.applyGoAirport = applyGoAirport;
