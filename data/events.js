/**
 * events.js
 * 황금열쇠 칸에 도착했을 때 뽑는 카드 데이터. (총 22종)
 *
 * type:
 *   "bonus"        : amount 만큼 여행 자금을 받는다
 *   "cost"         : amount 만큼 지출한다 (사회복지기금으로 일부 환원)
 *   "quiz"         : 세계 퀴즈를 풀고, 맞히면 QUIZ_CONFIG.eventReward 만큼 받는다
 *   "travel"       : 무작위 나라로 여행을 떠난다(도감 기록)
 *   "free_upgrade" : 내 나라 중 하나에 건물을 1단계 무료로 짓는다 (없으면 지원금 20만)
 *   "toll_shield"  : 다음 통행료 1회 면제 우대권을 획득한다 (보관형)
 *   "jump"         : steps 만큼 즉시 이동한다 (+앞으로 / -뒤로)
 *   "welfare_gift" : 복지기금에서 따뜻한 지원금을 받는다
 *   "go_airport"   : 세계여행(공항) 칸으로 즉시 이동한다
 *
 * weight: 뽑힐 상대 확률
 */

const EVENT_CARDS = [
  // 1) 자금 보너스 (6종)
  { id: "bonus_allowance", type: "bonus", weight: 3, emoji: "🎁", title: "용돈을 받았어요", desc: "할머니께서 여행 잘 다녀오라고 용돈을 주셨어요!", amount: 12 },
  { id: "bonus_photo",     type: "bonus", weight: 2, emoji: "📸", title: "여행 사진전 대상!", desc: "멋진 여행 풍경 사진으로 대회에서 대상을 탔어요!", amount: 25 },
  { id: "bonus_birthday",  type: "bonus", weight: 2, emoji: "🎂", title: "생일 축하 파티", desc: "친구들이 깜짝 생일 파티와 축하금을 모아주었어요!", amount: 15 },
  { id: "bonus_lottery",   type: "bonus", weight: 1, emoji: "🎰", title: "여행 복권 당첨!", desc: "공항 복권에 당첨되어 큰 여행 자금을 얻었어요!", amount: 35 },
  { id: "bonus_interest",  type: "bonus", weight: 2, emoji: "🏦", title: "은행 적금 만기", desc: "꾸준히 모은 여행 적금이 만기되어 이자를 받았어요!", amount: 18 },
  { id: "bonus_found",     type: "bonus", weight: 2, emoji: "✨", title: "행운의 보물 발견", desc: "해변을 걷다가 반짝이는 골동품 동전을 주웠어요!", amount: 14 },

  // 2) 소액 지출 (5종)
  { id: "cost_souvenir",   type: "cost",  weight: 3, emoji: "🛍️", title: "기념품을 잔뜩 샀어요", desc: "가족들에게 줄 인형과 열쇠고리를 샀어요.", amount: 10 },
  { id: "cost_lost_bag",   type: "cost",  weight: 2, emoji: "🎒", title: "짐을 잃어버렸어요", desc: "호텔에 가방을 두고 와서 수수료를 지불했어요.", amount: 14 },
  { id: "cost_rain",       type: "cost",  weight: 2, emoji: "☔", title: "폭우로 우비를 샀어요", desc: "갑작스러운 소나기로 튼튼한 우산과 장화를 샀어요.", amount: 8 },
  { id: "cost_food",       type: "cost",  weight: 3, emoji: "🍕", title: "미슐랭 맛집 탐방", desc: "현지의 유명한 전통 코스 요리를 맛있게 먹었어요!", amount: 12 },
  { id: "cost_insurance",  type: "cost",  weight: 2, emoji: "🩺", title: "여행자 안심 보험", desc: "안전한 여행을 위해 든든한 여행자 보험에 가입했어요.", amount: 9 },

  // 3) 특수 찬스 아이템 & 업그레이드 (4종)
  { id: "free_upgrade",    type: "free_upgrade", weight: 3, emoji: "🏗️", title: "무료 건축 지원권!", desc: "소유한 나라 중 1곳에 건물을 무료로 1단계 올려줍니다!" },
  { id: "toll_shield",     type: "toll_shield",  weight: 3, emoji: "🎟️", title: "통행료 면제 우대권", desc: "다음번 다른 사람의 나라에 걸렸을 때 통행료를 1회 면제합니다!" },
  { id: "welfare_gift",    type: "welfare_gift", weight: 2, emoji: "💝", title: "복지기금 특별 장학금", desc: "성실한 세계 탐험가로 선정되어 복지기금을 지원받았어요!", amount: 20 },
  { id: "go_airport",      type: "go_airport",   weight: 2, emoji: "🛫", title: "공항 직행 고속티켓", desc: "세계여행(공항) 칸으로 즉시 이동하여 다음 턴 여행을 준비합니다!" },

  // 4) 이동 및 탐험 (3종)
  { id: "travel_ticket",   type: "travel", weight: 3, emoji: "✈️", title: "무료 항공권 당첨!", desc: "전 세계 가고 싶은 나라로 무작위 자유 여행을 떠나요!" },
  { id: "jump_forward",    type: "jump",   weight: 2, emoji: "🚀", title: "순풍 타고 쾌속 질주", desc: "바람을 타고 앞으로 3칸 빠르게 전진합니다!", steps: 3 },
  { id: "jump_backward",   type: "jump",   weight: 2, emoji: "🧭", title: "길을 잘못 들었어요", desc: "지도를 거꾸로 보아 뒤로 2칸 돌아갑니다.", steps: -2 },

  // 5) 세계 지리 & 상식 퀴즈 (2종)
  { id: "quiz_world",      type: "quiz",   weight: 4, emoji: "❓", title: "세계 상식 퀴즈 도전!", desc: "퀴즈를 맞히면 푸짐한 상금을 받아요!" },
  { id: "quiz_capital",    type: "quiz",   weight: 3, emoji: "🧠", title: "수도 탐험가 퀴즈!", desc: "각 나라의 수도를 정확히 맞혀보세요!" },
];

window.EVENT_CARDS = EVENT_CARDS;
