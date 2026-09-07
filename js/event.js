/**
 * event.js
 * 이벤트 칸 도착 시 이벤트 카드를 뽑고, 그 효과를 게임 상태에 적용한다.
 * DOM을 건드리지 않는다 — 카드 내용을 화면에 보여주는 것은 main.js/ui.js가 한다.
 * 퀴즈 진행(정답 확인 등)도 main.js가 담당하고, 여기서는 "보상 지급"만 처리한다.
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

window.drawEventCard = drawEventCard;
window.applyMoneyEvent = applyMoneyEvent;
window.applyQuizReward = applyQuizReward;
window.applyTravelEvent = applyTravelEvent;
