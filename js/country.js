/**
 * country.js
 * 국가 데이터(countries.js) 조회 헬퍼 함수 모음.
 * 게임 엔진은 국가 정보가 필요할 때 반드시 이 함수들을 통해서만 접근한다.
 */

function getCountryById(id) {
  return window.COUNTRIES.find((c) => c.id === id) || null;
}

function getAllCountries() {
  return window.COUNTRIES;
}

function getCountriesByContinent(continent) {
  return window.COUNTRIES.filter((c) => c.continent === continent);
}

window.getCountryById = getCountryById;
window.getAllCountries = getAllCountries;
window.getCountriesByContinent = getCountriesByContinent;
