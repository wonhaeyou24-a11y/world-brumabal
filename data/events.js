/**
 * events.js
 * 이벤트 칸에 도착했을 때 뽑는 "이벤트 카드" 데이터.
 *
 * type:
 *   "bonus"  : amount 만큼 돈을 받는다
 *   "cost"   : amount 만큼 돈을 낸다
 *   "quiz"   : 세계 퀴즈를 풀고, 맞히면 QUIZ_CONFIG.eventReward 만큼 받는다
 *   "travel" : 무작위 나라로 여행을 떠난다(방문 도감에 기록, 통행료 없음)
 *
 * weight: 뽑힐 상대 확률 (클수록 자주 나온다)
 *
 * 카드를 추가/수정하려면 이 배열만 고치면 됩니다. 엔진 코드는 그대로 둡니다.
 */

const EVENT_CARDS = [
  { id: "bonus_allowance", type: "bonus", weight: 3, emoji: "🎁", title: "용돈을 받았어요", amount: 80 },
  { id: "bonus_photo",     type: "bonus", weight: 2, emoji: "📸", title: "여행 사진 대회 수상!", amount: 130 },
  { id: "bonus_found",     type: "bonus", weight: 1, emoji: "💰", title: "길에서 지갑을 주웠어요", amount: 100 },
  { id: "cost_souvenir",   type: "cost",  weight: 3, emoji: "🛍️", title: "기념품을 잔뜩 샀어요", amount: 60 },
  { id: "cost_lost_bag",   type: "cost",  weight: 2, emoji: "🎒", title: "짐을 잃어버렸어요", amount: 100 },
  { id: "cost_rain",       type: "cost",  weight: 1, emoji: "☔", title: "폭우로 우비를 샀어요", amount: 40 },
  { id: "quiz_world",      type: "quiz",  weight: 4, emoji: "❓", title: "세계 퀴즈 도전!" },
  { id: "travel_ticket",   type: "travel", weight: 3, emoji: "✈️", title: "무료 항공권 당첨!" },
];

window.EVENT_CARDS = EVENT_CARDS;
