/**
 * buildings.js
 * 건물 업그레이드 규칙 수치 전용 파일. (금액 단위: 만원)
 *
 * 내가 산 나라에 다시 도착하면 한 단계씩 건물을 지을 수 있다.
 * 밸런스를 조정하려면 이 파일의 숫자만 바꾸면 된다. (엔진 코드 수정 불필요)
 *
 *  costRate : 건설비 = 나라 가격 × costRate
 *  rentMul  : 통행료 = 나라 기본 통행료 × rentMul
 *  emoji    : 게임판/모달에 표시할 아이콘
 *  label    : 단계 이름
 *
 * 인덱스 0 = 땅만 있는 상태(건물 없음), 1~4 = 별장/빌딩/호텔/랜드마크
 */
const BUILDING_STAGES = [
  { level: 0, label: "땅",       emoji: "🟩", costRate: 0,   rentMul: 1 },
  { level: 1, label: "별장",     emoji: "🏠", costRate: 0.4, rentMul: 2 },
  { level: 2, label: "빌딩",     emoji: "🏢", costRate: 0.6, rentMul: 3.5 },
  { level: 3, label: "호텔",     emoji: "🏨", costRate: 0.8, rentMul: 5.5 },
  { level: 4, label: "랜드마크", emoji: "🗼", costRate: 1.2, rentMul: 8 },
];

const BUILDING_MAX_LEVEL = BUILDING_STAGES.length - 1;
/** 건물을 팔 때 돌려받는 비율 (파산 구제용으로 예약, 현재 미사용) */
const BUILDING_SELL_REFUND_RATE = 0.5;

window.BUILDING_STAGES = BUILDING_STAGES;
window.BUILDING_MAX_LEVEL = BUILDING_MAX_LEVEL;
window.BUILDING_SELL_REFUND_RATE = BUILDING_SELL_REFUND_RATE;
