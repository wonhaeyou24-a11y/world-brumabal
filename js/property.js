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

/** 파산 처리: 소유 국가를 모두 은행으로 반환하고 파산 표시 */
function bankruptPlayer(gameState, player) {
  player.isBankrupt = true;
  player.ownedCountries.forEach((id) => {
    delete gameState.countryOwners[id];
  });
  player.ownedCountries = [];
  player.money = 0;
}

/**
 * 통행료를 지급한다.
 * 반환: { ownerId, amount, bankrupt } (bankrupt=true면 낼 돈이 모자라 파산) 또는 통행료 대상이 아니면 null
 */
function payRentIfNeeded(gameState, players, payer, countryId) {
  const ownerId = getCountryOwnerId(gameState, countryId);
  if (ownerId === null || ownerId === payer.id) return null;

  const country = getCountryById(countryId);
  const owner = players.find((p) => p.id === ownerId);
  const rent = country.rent;

  if (payer.money < rent) {
    // 낼 돈이 모자람 → 가진 돈을 주인에게 넘기고 파산
    owner.money += Math.max(payer.money, 0);
    bankruptPlayer(gameState, payer);
    return { ownerId, amount: rent, paid: owner.money, bankrupt: true };
  }

  payer.money -= rent;
  owner.money += rent;
  return { ownerId, amount: rent, bankrupt: false };
}

window.getCountryOwnerId = getCountryOwnerId;
window.getEffectivePrice = getEffectivePrice;
window.canBuyCountry = canBuyCountry;
window.buyCountry = buyCountry;
window.payRentIfNeeded = payRentIfNeeded;
window.bankruptPlayer = bankruptPlayer;
