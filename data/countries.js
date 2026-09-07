/**
 * countries.js
 * 국가 데이터 전용 파일.
 *
 * 새 국가를 추가하려면 이 배열에 객체만 추가하면 됩니다.
 * game.js, board.js 등 엔진 코드는 절대 수정할 필요가 없습니다.
 *
 * 필드 설명:
 *  id           : 국가 고유 ID (게임 엔진이 이 값으로 참조함)
 *  nameKo       : 국가명 (한글)
 *  nameEn       : 국가명 (영문)
 *  capitalKo    : 수도 (한글)
 *  continent    : 대륙 (아시아 / 유럽 / 북아메리카 / 남아메리카 / 아프리카 / 오세아니아)
 *  flagType     : "emoji" (현재) | "image" (향후 확장)
 *  flag         : 국기 이모지 또는 이미지 경로
 *  price        : 구매 가격
 *  rent         : 기본 통행료
 *
 * 향후 확장 예정 필드(현재 미사용, 자유롭게 추가 가능):
 *  description, currency, population, landmark,
 *  quizIds, buildingLevels, buildingPrices, buildingRents, travelBonus
 */

const COUNTRIES = [
  // ---------------- 아시아 ----------------
  { id: "KR", nameKo: "대한민국",       nameEn: "South Korea", capitalKo: "서울",       continent: "아시아",     flagType: "emoji", flag: "🇰🇷", price: 120, rent: 24 },
  { id: "JP", nameKo: "일본",           nameEn: "Japan",       capitalKo: "도쿄",       continent: "아시아",     flagType: "emoji", flag: "🇯🇵", price: 160, rent: 32 },
  { id: "CN", nameKo: "중국",           nameEn: "China",       capitalKo: "베이징",     continent: "아시아",     flagType: "emoji", flag: "🇨🇳", price: 180, rent: 36 },
  { id: "TH", nameKo: "태국",           nameEn: "Thailand",    capitalKo: "방콕",       continent: "아시아",     flagType: "emoji", flag: "🇹🇭", price: 100, rent: 20 },
  { id: "VN", nameKo: "베트남",         nameEn: "Vietnam",     capitalKo: "하노이",     continent: "아시아",     flagType: "emoji", flag: "🇻🇳", price: 90,  rent: 18 },
  { id: "SG", nameKo: "싱가포르",       nameEn: "Singapore",   capitalKo: "싱가포르",   continent: "아시아",     flagType: "emoji", flag: "🇸🇬", price: 140, rent: 28 },

  // ---------------- 유럽 ----------------
  { id: "GB", nameKo: "영국",           nameEn: "United Kingdom", capitalKo: "런던",   continent: "유럽",       flagType: "emoji", flag: "🇬🇧", price: 200, rent: 40 },
  { id: "FR", nameKo: "프랑스",         nameEn: "France",      capitalKo: "파리",       continent: "유럽",       flagType: "emoji", flag: "🇫🇷", price: 200, rent: 40 },
  { id: "DE", nameKo: "독일",           nameEn: "Germany",     capitalKo: "베를린",     continent: "유럽",       flagType: "emoji", flag: "🇩🇪", price: 190, rent: 38 },
  { id: "IT", nameKo: "이탈리아",       nameEn: "Italy",       capitalKo: "로마",       continent: "유럽",       flagType: "emoji", flag: "🇮🇹", price: 170, rent: 34 },
  { id: "ES", nameKo: "스페인",         nameEn: "Spain",       capitalKo: "마드리드",   continent: "유럽",       flagType: "emoji", flag: "🇪🇸", price: 150, rent: 30 },

  // ---------------- 북아메리카 ----------------
  { id: "US", nameKo: "미국",           nameEn: "United States", capitalKo: "워싱턴 D.C.", continent: "북아메리카", flagType: "emoji", flag: "🇺🇸", price: 220, rent: 44 },
  { id: "CA", nameKo: "캐나다",         nameEn: "Canada",      capitalKo: "오타와",     continent: "북아메리카", flagType: "emoji", flag: "🇨🇦", price: 160, rent: 32 },
  { id: "MX", nameKo: "멕시코",         nameEn: "Mexico",      capitalKo: "멕시코시티", continent: "북아메리카", flagType: "emoji", flag: "🇲🇽", price: 110, rent: 22 },

  // ---------------- 남아메리카 ----------------
  { id: "BR", nameKo: "브라질",         nameEn: "Brazil",      capitalKo: "브라질리아", continent: "남아메리카", flagType: "emoji", flag: "🇧🇷", price: 130, rent: 26 },
  { id: "AR", nameKo: "아르헨티나",     nameEn: "Argentina",   capitalKo: "부에노스아이레스", continent: "남아메리카", flagType: "emoji", flag: "🇦🇷", price: 100, rent: 20 },

  // ---------------- 아프리카 ----------------
  { id: "EG", nameKo: "이집트",         nameEn: "Egypt",       capitalKo: "카이로",     continent: "아프리카",   flagType: "emoji", flag: "🇪🇬", price: 90,  rent: 18 },
  { id: "ZA", nameKo: "남아프리카공화국", nameEn: "South Africa", capitalKo: "프리토리아", continent: "아프리카", flagType: "emoji", flag: "🇿🇦", price: 100, rent: 20 },

  // ---------------- 오세아니아 ----------------
  { id: "AU", nameKo: "호주",           nameEn: "Australia",   capitalKo: "캔버라",     continent: "오세아니아", flagType: "emoji", flag: "🇦🇺", price: 150, rent: 30 },
  { id: "NZ", nameKo: "뉴질랜드",       nameEn: "New Zealand", capitalKo: "웰링턴",     continent: "오세아니아", flagType: "emoji", flag: "🇳🇿", price: 110, rent: 22 },
];

// 브라우저 전역에서 접근 가능하도록 등록 (모듈 번들러 없이 script 태그로 로드)
window.COUNTRIES = COUNTRIES;
