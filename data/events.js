/**
 * events.js
 * 황금열쇠 칸에 도착했을 때 뽑는 카드 데이터. (금액 단위: 만원)
 *
 * type:
 *   "bonus"  : amount 만큼 여행 자금을 받는다
 *   "cost"   : amount 만큼 낸다
 *   "quiz"   : 세계 퀴즈를 풀고, 맞히면 QUIZ_CONFIG.eventReward 만큼 받는다
 *   "travel" : 무작위 나라로 여행을 떠난다(도감 기록, 통행료 없음)
 *
 * weight: 뽑힐 상대 확률 (클수록 자주 나온다)
 */

const EVENT_CARDS = [
  { id: "bonus_allowance", type: "bonus", weight: 3, emoji: "🎁", title: "용돈을 받았어요", amount: 12 },
  { id: "bonus_photo",     type: "bonus", weight: 2, emoji: "📸", title: "여행 사진 대회 수상!", amount: 20 },
  { id: "bonus_birthday",  type: "bonus", weight: 2, emoji: "🎂", title: "생일 파티 선물", amount: 10 },
  { id: "bonus_found",     type: "bonus", weight: 1, emoji: "💰", title: "길에서 지갑을 주웠어요", amount: 15 },
  { id: "cost_souvenir",   type: "cost",  weight: 3, emoji: "🛍️", title: "기념품을 잔뜩 샀어요", amount: 10 },
  { id: "cost_lost_bag",   type: "cost",  weight: 2, emoji: "🎒", title: "짐을 잃어버렸어요", amount: 15 },
  { id: "cost_rain",       type: "cost",  weight: 1, emoji: "☔", title: "폭우로 우비를 샀어요", amount: 7 },
  { id: "quiz_world",      type: "quiz",  weight: 4, emoji: "❓", title: "세계 퀴즈 도전!" },
  { id: "travel_ticket",   type: "travel", weight: 3, emoji: "✈️", title: "무료 항공권 당첨!" },
];

window.EVENT_CARDS = EVENT_CARDS;
