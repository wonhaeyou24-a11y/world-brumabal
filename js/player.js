/**
 * player.js
 * 플레이어 데이터 모델.
 */

function createPlayer(id, name, character, color, startMoney, isAI = false) {
  return {
    id,                    // 플레이어 고유 ID (0, 1, 2, 3)
    name,                  // 플레이어 이름
    character,             // 캐릭터 이모지
    color,                 // 플레이어 색상 (게임판 표시용)
    money: startMoney,     // 현재 자금
    position: 0,           // 게임판 칸 인덱스 (0 = START)
    ownedCountries: [],    // 소유 국가 ID 배열
    isBankrupt: false,     // 파산 여부 (2차 개발 확장용, 현재는 항상 false)
    isAI: !!isAI,          // AI가 대신 플레이하는 플레이어인지
  };
}

/** 플레이어의 총 자산 = 현금 + 소유 국가 구매가 합 */
function getPlayerNetWorth(player) {
  const countryValue = player.ownedCountries.reduce((sum, countryId) => {
    const country = getCountryById(countryId);
    return sum + (country ? country.price : 0);
  }, 0);
  return player.money + countryValue;
}

window.createPlayer = createPlayer;
window.getPlayerNetWorth = getPlayerNetWorth;
