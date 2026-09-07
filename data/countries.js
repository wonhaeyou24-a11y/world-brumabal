/**
 * countries.js
 * 국가 데이터 전용 파일.
 *
 * 새 국가를 추가하려면 이 배열에 객체만 추가하면 됩니다.
 * 엔진 코드(game.js, board.js 등)는 수정할 필요가 없습니다.
 *
 * 필드:
 *  id           : 국가 고유 ID
 *  nameKo/nameEn : 국가명
 *  capitalKo    : 수도
 *  continent    : 대륙
 *  flag         : 국기 이모지
 *  landmarkKo   : 대표 랜드마크(나라 카드에 표시)
 *  landmarkImg  : 랜드마크 사진 경로 (assets/landmarks/<id>.jpg). 파일이 없으면 국기가 대신 표시됨
 *  price        : 구매 가격 (단위: 만원)
 *  rent         : 기본 통행료 (단위: 만원)
 */

const COUNTRIES = [
  // ---------------- 아시아 ----------------
  { id: "KR", nameKo: "대한민국", nameEn: "South Korea", capitalKo: "서울",   continent: "아시아", flag: "🇰🇷", landmarkKo: "경복궁",           landmarkImg: "assets/landmarks/KR.jpg", price: 50, rent: 10 },
  { id: "JP", nameKo: "일본",     nameEn: "Japan",       capitalKo: "도쿄",   continent: "아시아", flag: "🇯🇵", landmarkKo: "도쿄 타워",         landmarkImg: "assets/landmarks/JP.jpg", price: 65, rent: 13 },
  { id: "CN", nameKo: "중국",     nameEn: "China",       capitalKo: "베이징", continent: "아시아", flag: "🇨🇳", landmarkKo: "만리장성",         landmarkImg: "assets/landmarks/CN.jpg", price: 70, rent: 14 },
  { id: "IN", nameKo: "인도",     nameEn: "India",       capitalKo: "뉴델리", continent: "아시아", flag: "🇮🇳", landmarkKo: "타지마할",         landmarkImg: "assets/landmarks/IN.jpg", price: 45, rent: 9 },
  { id: "TH", nameKo: "태국",     nameEn: "Thailand",    capitalKo: "방콕",   continent: "아시아", flag: "🇹🇭", landmarkKo: "왓 프라깨우",       landmarkImg: "assets/landmarks/TH.jpg", price: 42, rent: 8 },
  { id: "VN", nameKo: "베트남",   nameEn: "Vietnam",     capitalKo: "하노이", continent: "아시아", flag: "🇻🇳", landmarkKo: "하롱베이",         landmarkImg: "assets/landmarks/VN.jpg", price: 38, rent: 8 },
  { id: "SG", nameKo: "싱가포르", nameEn: "Singapore",   capitalKo: "싱가포르", continent: "아시아", flag: "🇸🇬", landmarkKo: "마리나 베이 샌즈", landmarkImg: "assets/landmarks/SG.jpg", price: 60, rent: 12 },
  { id: "AE", nameKo: "아랍에미리트", nameEn: "UAE",      capitalKo: "아부다비", continent: "아시아", flag: "🇦🇪", landmarkKo: "셰이크 자이드 모스크", landmarkImg: "assets/landmarks/AE.jpg", price: 62, rent: 12 },
  { id: "SA", nameKo: "사우디아라비아", nameEn: "Saudi Arabia", capitalKo: "리야드", continent: "아시아", flag: "🇸🇦", landmarkKo: "킹덤 센터",  landmarkImg: "assets/landmarks/SA.jpg", price: 55, rent: 11 },

  // ---------------- 유럽 ----------------
  { id: "GB", nameKo: "영국",     nameEn: "United Kingdom", capitalKo: "런던",   continent: "유럽", flag: "🇬🇧", landmarkKo: "빅벤",             landmarkImg: "assets/landmarks/GB.jpg", price: 80, rent: 16 },
  { id: "FR", nameKo: "프랑스",   nameEn: "France",        capitalKo: "파리",   continent: "유럽", flag: "🇫🇷", landmarkKo: "에펠탑",           landmarkImg: "assets/landmarks/FR.jpg", price: 80, rent: 16 },
  { id: "DE", nameKo: "독일",     nameEn: "Germany",       capitalKo: "베를린", continent: "유럽", flag: "🇩🇪", landmarkKo: "브란덴부르크 문", landmarkImg: "assets/landmarks/DE.jpg", price: 75, rent: 15 },
  { id: "IT", nameKo: "이탈리아", nameEn: "Italy",         capitalKo: "로마",   continent: "유럽", flag: "🇮🇹", landmarkKo: "콜로세움",         landmarkImg: "assets/landmarks/IT.jpg", price: 68, rent: 14 },
  { id: "ES", nameKo: "스페인",   nameEn: "Spain",         capitalKo: "마드리드", continent: "유럽", flag: "🇪🇸", landmarkKo: "마드리드 왕궁", landmarkImg: "assets/landmarks/ES.jpg", price: 58, rent: 12 },
  { id: "NL", nameKo: "네덜란드", nameEn: "Netherlands",   capitalKo: "암스테르담", continent: "유럽", flag: "🇳🇱", landmarkKo: "잔세스칸스 풍차", landmarkImg: "assets/landmarks/NL.jpg", price: 66, rent: 13 },
  { id: "CH", nameKo: "스위스",   nameEn: "Switzerland",   capitalKo: "베른",   continent: "유럽", flag: "🇨🇭", landmarkKo: "마터호른",         landmarkImg: "assets/landmarks/CH.jpg", price: 78, rent: 16 },
  { id: "SE", nameKo: "스웨덴",   nameEn: "Sweden",        capitalKo: "스톡홀름", continent: "유럽", flag: "🇸🇪", landmarkKo: "감라스탄",       landmarkImg: "assets/landmarks/SE.jpg", price: 62, rent: 12 },
  { id: "GR", nameKo: "그리스",   nameEn: "Greece",        capitalKo: "아테네", continent: "유럽", flag: "🇬🇷", landmarkKo: "파르테논 신전",   landmarkImg: "assets/landmarks/GR.jpg", price: 52, rent: 10 },
  { id: "RU", nameKo: "러시아",   nameEn: "Russia",        capitalKo: "모스크바", continent: "유럽", flag: "🇷🇺", landmarkKo: "성 바실리 대성당", landmarkImg: "assets/landmarks/RU.jpg", price: 60, rent: 12 },

  // ---------------- 북아메리카 ----------------
  { id: "US", nameKo: "미국",     nameEn: "United States", capitalKo: "워싱턴 D.C.", continent: "북아메리카", flag: "🇺🇸", landmarkKo: "자유의 여신상", landmarkImg: "assets/landmarks/US.jpg", price: 90, rent: 18 },
  { id: "CA", nameKo: "캐나다",   nameEn: "Canada",        capitalKo: "오타와", continent: "북아메리카", flag: "🇨🇦", landmarkKo: "나이아가라 폭포", landmarkImg: "assets/landmarks/CA.jpg", price: 64, rent: 13 },
  { id: "MX", nameKo: "멕시코",   nameEn: "Mexico",        capitalKo: "멕시코시티", continent: "북아메리카", flag: "🇲🇽", landmarkKo: "치첸이트사", landmarkImg: "assets/landmarks/MX.jpg", price: 44, rent: 9 },

  // ---------------- 남아메리카 ----------------
  { id: "BR", nameKo: "브라질",   nameEn: "Brazil",        capitalKo: "브라질리아", continent: "남아메리카", flag: "🇧🇷", landmarkKo: "예수상", landmarkImg: "assets/landmarks/BR.jpg", price: 50, rent: 10 },
  { id: "AR", nameKo: "아르헨티나", nameEn: "Argentina",   capitalKo: "부에노스아이레스", continent: "남아메리카", flag: "🇦🇷", landmarkKo: "이과수 폭포", landmarkImg: "assets/landmarks/AR.jpg", price: 42, rent: 8 },
  { id: "PE", nameKo: "페루",     nameEn: "Peru",          capitalKo: "리마",   continent: "남아메리카", flag: "🇵🇪", landmarkKo: "마추픽추",       landmarkImg: "assets/landmarks/PE.jpg", price: 46, rent: 9 },
  { id: "CL", nameKo: "칠레",     nameEn: "Chile",         capitalKo: "산티아고", continent: "남아메리카", flag: "🇨🇱", landmarkKo: "모아이 석상",   landmarkImg: "assets/landmarks/CL.jpg", price: 44, rent: 9 },

  // ---------------- 아프리카 ----------------
  { id: "EG", nameKo: "이집트",   nameEn: "Egypt",         capitalKo: "카이로", continent: "아프리카", flag: "🇪🇬", landmarkKo: "기자 피라미드", landmarkImg: "assets/landmarks/EG.jpg", price: 40, rent: 8 },
  { id: "ZA", nameKo: "남아프리카공화국", nameEn: "South Africa", capitalKo: "프리토리아", continent: "아프리카", flag: "🇿🇦", landmarkKo: "테이블 마운틴", landmarkImg: "assets/landmarks/ZA.jpg", price: 42, rent: 8 },
  { id: "KE", nameKo: "케냐",     nameEn: "Kenya",         capitalKo: "나이로비", continent: "아프리카", flag: "🇰🇪", landmarkKo: "마사이마라",   landmarkImg: "assets/landmarks/KE.jpg", price: 38, rent: 8 },
  { id: "MA", nameKo: "모로코",   nameEn: "Morocco",       capitalKo: "라바트", continent: "아프리카", flag: "🇲🇦", landmarkKo: "하산 탑",         landmarkImg: "assets/landmarks/MA.jpg", price: 40, rent: 8 },

  // ---------------- 오세아니아 ----------------
  { id: "AU", nameKo: "호주",     nameEn: "Australia",     capitalKo: "캔버라", continent: "오세아니아", flag: "🇦🇺", landmarkKo: "오페라 하우스", landmarkImg: "assets/landmarks/AU.jpg", price: 60, rent: 12 },
  { id: "NZ", nameKo: "뉴질랜드", nameEn: "New Zealand",   capitalKo: "웰링턴", continent: "오세아니아", flag: "🇳🇿", landmarkKo: "밀포드 사운드", landmarkImg: "assets/landmarks/NZ.jpg", price: 46, rent: 9 },
];

window.COUNTRIES = COUNTRIES;
