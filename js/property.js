/**
 * property.js
 * 국가 구매 / 소유권 / 통행료 지급 로직.
 * 이 파일은 gameState.countryOwners (countryId -> playerId 맵)를 조작한다.
 */

function getCountryOwnerId(gameState, countryId) {
  return gameState.countryOwners[countryId] ?? null;
}

/** 할인율(0~1)을 반영한 실제 구매가 */
function getEffectivePrice(country, discountRate = 0) {
  return Math.round(country.price * (1 - discountRate));
}

function canBuyCountry(gameState, player, countryId, discountRate = 0) {
  const country = getCountryById(countryId);
  if (!country) return false;
  const ownerId = getCountryOwnerId(gameState, countryId);
  if (ownerId !== null) return false; // 이미 소유자가 있음
  if (player.money < getEffectivePrice(country, discountRate)) return false; // 자금 부족
  return true;
}

/** 국가 구매를 실행한다. 성공 시 true 반환. discountRate: 퀴즈 정답 할인 등 */
function buyCountry(gameState, player, countryId, discountRate = 0) {
  if (!canBuyCountry(gameState, player, countryId, discountRate)) return false;
  const country = getCountryById(countryId);

  player.money -= getEffectivePrice(country, discountRate);
  player.ownedCountries.push(countryId);
  gameState.countryOwners[countryId] = player.id;

  return true;
}

/**
 * 통행료를 지급한다. (돈이 부족해도 게임이 멈추지 않도록 0 이하로는 내려가되 강제 진행)
 * 반환값: { ownerId, amount, payerRemaining, ownerRemaining } 또는 통행료 대상이 아니면 null
 */
function payRentIfNeeded(gameState, players, payer, countryId) {
  const ownerId = getCountryOwnerId(gameState, countryId);
  if (ownerId === null || ownerId === payer.id) return null; // 무소유이거나 본인 소유면 통행료 없음

  const country = getCountryById(countryId);
  const owner = players.find((p) => p.id === ownerId);
  const amount = Math.min(country.rent, Math.max(payer.money, 0)); // 부족하면 가진 만큼만 지불 (파산 처리는 2차 개발)

  payer.money -= amount;
  owner.money += amount;

  return {
    ownerId,
    amount,
    payerRemaining: payer.money,
    ownerRemaining: owner.money,
  };
}

window.getCountryOwnerId = getCountryOwnerId;
window.getEffectivePrice = getEffectivePrice;
window.canBuyCountry = canBuyCountry;
window.buyCountry = buyCountry;
window.payRentIfNeeded = payRentIfNeeded;
