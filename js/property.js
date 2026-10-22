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
    if (gameState.buildings) delete gameState.buildings[id]; // 건물도 함께 사라짐
  });
  player.ownedCountries = [];
  player.buildingInvest = 0;
  player.money = 0;
}

/* ---------------------------------------------------------
   건물 업그레이드 (별장 → 빌딩 → 호텔 → 랜드마크)
   gameState.buildings : countryId -> 단계(0~4)
--------------------------------------------------------- */

/** 값을 0~최대 단계 사이 정수로 안전하게 보정 (저장 데이터 변조·오류 대비) */
function clampBuildingLevel(v) {
  const max = window.BUILDING_MAX_LEVEL ?? 4;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), max);
}

function getBuildingLevel(gameState, countryId) {
  if (!gameState || !gameState.buildings) return 0;
  return clampBuildingLevel(gameState.buildings[countryId]);
}

/** 특정 나라의 현재 통행료 = 기본 통행료 × 건물 단계 배수 */
function getCurrentRent(gameState, countryId) {
  const country = getCountryById(countryId);
  if (!country) return 0;
  const stage = (window.BUILDING_STAGES || [])[getBuildingLevel(gameState, countryId)];
  const mul = stage ? stage.rentMul : 1;
  return Math.round(country.rent * mul);
}

/**
 * 다음 단계 건설 정보. 더 지을 수 없으면 null.
 * 반환: { nextLevel, cost, stage, rentAfter }
 */
function getNextBuildInfo(gameState, countryId) {
  const country = getCountryById(countryId);
  const stages = window.BUILDING_STAGES || [];
  if (!country || stages.length === 0) return null;
  const level = getBuildingLevel(gameState, countryId);
  const next = stages[level + 1];
  if (!next) return null; // 이미 최고 단계(랜드마크)
  return {
    nextLevel: next.level,
    cost: Math.round(country.price * next.costRate),
    stage: next,
    rentAfter: Math.round(country.rent * next.rentMul),
  };
}

/** 이 플레이어가 이 나라에 다음 단계를 지을 수 있는가 (내 땅 + 자금 충분 + 최고 단계 아님) */
function canBuildNext(gameState, player, countryId) {
  if (getCountryOwnerId(gameState, countryId) !== player.id) return false;
  const info = getNextBuildInfo(gameState, countryId);
  if (!info) return false;
  return player.money >= info.cost;
}

/** 한 단계 건설 실행. 성공 시 { level, cost, stage } 반환, 실패 시 null */
function buildNextLevel(gameState, player, countryId) {
  if (!canBuildNext(gameState, player, countryId)) return null;
  const info = getNextBuildInfo(gameState, countryId);
  if (!gameState.buildings) gameState.buildings = {};
  player.money -= info.cost;
  player.buildingInvest = (player.buildingInvest || 0) + info.cost;
  gameState.buildings[countryId] = info.nextLevel;
  return { level: info.nextLevel, cost: info.cost, stage: info.stage };
}

/** 플레이어가 가진 건물 수 (단계 1 이상인 나라 개수) */
function countPlayerBuildings(gameState, player) {
  return player.ownedCountries.filter((id) => getBuildingLevel(gameState, id) > 0).length;
}

/** 저장 데이터 불러온 뒤 건물 정보를 검증·정리 (없으면 빈 값, 남의 땅에 건물이 있으면 제거) */
function sanitizeBuildings(gameState) {
  const clean = {};
  const src = gameState && typeof gameState.buildings === "object" && gameState.buildings ? gameState.buildings : {};
  Object.keys(src).forEach((id) => {
    const lv = clampBuildingLevel(src[id]);
    const hasOwner = gameState.countryOwners && gameState.countryOwners[id] !== undefined;
    if (lv > 0 && hasOwner && getCountryById(id)) clean[id] = lv;
  });
  gameState.buildings = clean;
  (gameState.players || []).forEach((p) => {
    const inv = Math.floor(Number(p.buildingInvest));
    p.buildingInvest = Number.isFinite(inv) && inv > 0 ? inv : 0;
  });
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
  const rent = getCurrentRent(gameState, countryId); // 건물 단계 배수 반영

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
window.getBuildingLevel = getBuildingLevel;
window.getCurrentRent = getCurrentRent;
window.getNextBuildInfo = getNextBuildInfo;
window.canBuildNext = canBuildNext;
window.buildNextLevel = buildNextLevel;
window.countPlayerBuildings = countPlayerBuildings;
window.sanitizeBuildings = sanitizeBuildings;
