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
  { id: "TR", nameKo: "튀르키예", nameEn: "Türkiye",     capitalKo: "앙카라", continent: "아시아", flag: "🇹🇷", landmarkKo: "아야소피아",      landmarkImg: "assets/landmarks/TR.jpg", price: 58, rent: 12 },
  { id: "MN", nameKo: "몽골",     nameEn: "Mongolia",    capitalKo: "울란바토르", continent: "아시아", flag: "🇲🇳", landmarkKo: "칭기즈칸 기마상", landmarkImg: "assets/landmarks/MN.jpg", price: 42, rent: 8 },
  { id: "ID", nameKo: "인도네시아", nameEn: "Indonesia", capitalKo: "자카르타", continent: "아시아", flag: "🇮🇩", landmarkKo: "보로부두르 사원", landmarkImg: "assets/landmarks/ID.jpg", price: 46, rent: 9 },
  { id: "PH", nameKo: "필리핀",   nameEn: "Philippines", capitalKo: "마닐라", continent: "아시아", flag: "🇵🇭", landmarkKo: "초콜릿 힐즈",     landmarkImg: "assets/landmarks/PH.jpg", price: 42, rent: 8 },
  { id: "MY", nameKo: "말레이시아", nameEn: "Malaysia",  capitalKo: "쿠알라룸푸르", continent: "아시아", flag: "🇲🇾", landmarkKo: "페트로나스 트윈타워", landmarkImg: "assets/landmarks/MY.jpg", price: 56, rent: 11 },
  { id: "NP", nameKo: "네팔",     nameEn: "Nepal",       capitalKo: "카트만두", continent: "아시아", flag: "🇳🇵", landmarkKo: "에베레스트산",   landmarkImg: "assets/landmarks/NP.jpg", price: 44, rent: 9 },
  { id: "KH", nameKo: "캄보디아", nameEn: "Cambodia",    capitalKo: "프놈펜", continent: "아시아", flag: "🇰🇭", landmarkKo: "앙코르 와트",     landmarkImg: "assets/landmarks/KH.jpg", price: 44, rent: 9 },

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
  { id: "PT", nameKo: "포르투갈", nameEn: "Portugal",      capitalKo: "리스본", continent: "유럽", flag: "🇵🇹", landmarkKo: "벨렝 탑",         landmarkImg: "assets/landmarks/PT.jpg", price: 58, rent: 12 },
  { id: "AT", nameKo: "오스트리아", nameEn: "Austria",     capitalKo: "빈",     continent: "유럽", flag: "🇦🇹", landmarkKo: "쇤브룬 궁전",     landmarkImg: "assets/landmarks/AT.jpg", price: 66, rent: 13 },
  { id: "NO", nameKo: "노르웨이", nameEn: "Norway",        capitalKo: "오슬로", continent: "유럽", flag: "🇳🇴", landmarkKo: "예이랑에르 피오르", landmarkImg: "assets/landmarks/NO.jpg", price: 70, rent: 14 },
  { id: "PL", nameKo: "폴란드",   nameEn: "Poland",        capitalKo: "바르샤바", continent: "유럽", flag: "🇵🇱", landmarkKo: "바벨 성",         landmarkImg: "assets/landmarks/PL.jpg", price: 54, rent: 11 },
  { id: "CZ", nameKo: "체코",     nameEn: "Czechia",       capitalKo: "프라하", continent: "유럽", flag: "🇨🇿", landmarkKo: "프라하 성",       landmarkImg: "assets/landmarks/CZ.jpg", price: 60, rent: 12 },
  { id: "IE", nameKo: "아일랜드", nameEn: "Ireland",       capitalKo: "더블린", continent: "유럽", flag: "🇮🇪", landmarkKo: "모허 절벽",       landmarkImg: "assets/landmarks/IE.jpg", price: 56, rent: 11 },

  // ---------------- 북아메리카 ----------------
  { id: "US", nameKo: "미국",     nameEn: "United States", capitalKo: "워싱턴 D.C.", continent: "북아메리카", flag: "🇺🇸", landmarkKo: "자유의 여신상", landmarkImg: "assets/landmarks/US.jpg", price: 90, rent: 18 },
  { id: "CA", nameKo: "캐나다",   nameEn: "Canada",        capitalKo: "오타와", continent: "북아메리카", flag: "🇨🇦", landmarkKo: "나이아가라 폭포", landmarkImg: "assets/landmarks/CA.jpg", price: 64, rent: 13 },
  { id: "MX", nameKo: "멕시코",   nameEn: "Mexico",        capitalKo: "멕시코시티", continent: "북아메리카", flag: "🇲🇽", landmarkKo: "치첸이트사", landmarkImg: "assets/landmarks/MX.jpg", price: 44, rent: 9 },
  { id: "CU", nameKo: "쿠바",     nameEn: "Cuba",          capitalKo: "아바나", continent: "북아메리카", flag: "🇨🇺", landmarkKo: "아바나 말레콘", landmarkImg: "assets/landmarks/CU.jpg", price: 40, rent: 8 },
  { id: "GT", nameKo: "과테말라", nameEn: "Guatemala",     capitalKo: "과테말라시티", continent: "북아메리카", flag: "🇬🇹", landmarkKo: "티칼 유적", landmarkImg: "assets/landmarks/GT.jpg", price: 40, rent: 8 },

  // ---------------- 남아메리카 ----------------
  { id: "BR", nameKo: "브라질",   nameEn: "Brazil",        capitalKo: "브라질리아", continent: "남아메리카", flag: "🇧🇷", landmarkKo: "예수상", landmarkImg: "assets/landmarks/BR.jpg", price: 50, rent: 10 },
  { id: "AR", nameKo: "아르헨티나", nameEn: "Argentina",   capitalKo: "부에노스아이레스", continent: "남아메리카", flag: "🇦🇷", landmarkKo: "이과수 폭포", landmarkImg: "assets/landmarks/AR.jpg", price: 42, rent: 8 },
  { id: "PE", nameKo: "페루",     nameEn: "Peru",          capitalKo: "리마",   continent: "남아메리카", flag: "🇵🇪", landmarkKo: "마추픽추",       landmarkImg: "assets/landmarks/PE.jpg", price: 46, rent: 9 },
  { id: "CL", nameKo: "칠레",     nameEn: "Chile",         capitalKo: "산티아고", continent: "남아메리카", flag: "🇨🇱", landmarkKo: "모아이 석상",   landmarkImg: "assets/landmarks/CL.jpg", price: 44, rent: 9 },
  { id: "CO", nameKo: "콜롬비아", nameEn: "Colombia",      capitalKo: "보고타", continent: "남아메리카", flag: "🇨🇴", landmarkKo: "산펠리페 요새", landmarkImg: "assets/landmarks/CO.jpg", price: 46, rent: 9 },
  { id: "BO", nameKo: "볼리비아", nameEn: "Bolivia",       capitalKo: "라파스", continent: "남아메리카", flag: "🇧🇴", landmarkKo: "우유니 소금사막", landmarkImg: "assets/landmarks/BO.jpg", price: 42, rent: 8 },
  { id: "EC", nameKo: "에콰도르", nameEn: "Ecuador",       capitalKo: "키토",   continent: "남아메리카", flag: "🇪🇨", landmarkKo: "갈라파고스",     landmarkImg: "assets/landmarks/EC.jpg", price: 46, rent: 9 },

  // ---------------- 아프리카 ----------------
  { id: "EG", nameKo: "이집트",   nameEn: "Egypt",         capitalKo: "카이로", continent: "아프리카", flag: "🇪🇬", landmarkKo: "기자 피라미드", landmarkImg: "assets/landmarks/EG.jpg", price: 40, rent: 8 },
  { id: "ZA", nameKo: "남아공",   nameEn: "South Africa", capitalKo: "프리토리아", continent: "아프리카", flag: "🇿🇦", landmarkKo: "테이블 마운틴", landmarkImg: "assets/landmarks/ZA.jpg", price: 42, rent: 8 },
  { id: "KE", nameKo: "케냐",     nameEn: "Kenya",         capitalKo: "나이로비", continent: "아프리카", flag: "🇰🇪", landmarkKo: "마사이마라",   landmarkImg: "assets/landmarks/KE.jpg", price: 38, rent: 8 },
  { id: "MA", nameKo: "모로코",   nameEn: "Morocco",       capitalKo: "라바트", continent: "아프리카", flag: "🇲🇦", landmarkKo: "하산 탑",         landmarkImg: "assets/landmarks/MA.jpg", price: 40, rent: 8 },
  { id: "TZ", nameKo: "탄자니아", nameEn: "Tanzania",      capitalKo: "도도마", continent: "아프리카", flag: "🇹🇿", landmarkKo: "킬리만자로산",   landmarkImg: "assets/landmarks/TZ.jpg", price: 42, rent: 8 },
  { id: "ET", nameKo: "에티오피아", nameEn: "Ethiopia",   capitalKo: "아디스아바바", continent: "아프리카", flag: "🇪🇹", landmarkKo: "랄리벨라 암굴교회", landmarkImg: "assets/landmarks/ET.jpg", price: 38, rent: 8 },
  { id: "MG", nameKo: "마다가스카르", nameEn: "Madagascar", capitalKo: "안타나나리보", continent: "아프리카", flag: "🇲🇬", landmarkKo: "바오바브 거리", landmarkImg: "assets/landmarks/MG.jpg", price: 40, rent: 8 },
  { id: "TN", nameKo: "튀니지",   nameEn: "Tunisia",       capitalKo: "튀니스", continent: "아프리카", flag: "🇹🇳", landmarkKo: "카르타고 유적",   landmarkImg: "assets/landmarks/TN.jpg", price: 40, rent: 8 },

  // ---------------- 오세아니아 ----------------
  { id: "AU", nameKo: "호주",     nameEn: "Australia",     capitalKo: "캔버라", continent: "오세아니아", flag: "🇦🇺", landmarkKo: "오페라 하우스", landmarkImg: "assets/landmarks/AU.jpg", price: 60, rent: 12 },
  { id: "NZ", nameKo: "뉴질랜드", nameEn: "New Zealand",   capitalKo: "웰링턴", continent: "오세아니아", flag: "🇳🇿", landmarkKo: "밀포드 사운드", landmarkImg: "assets/landmarks/NZ.jpg", price: 46, rent: 9 },
];

window.COUNTRIES = COUNTRIES;
