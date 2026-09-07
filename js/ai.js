/**
 * ai.js
 * AI 플레이어의 의사결정 로직 (순수 함수 — DOM/타이머 없음).
 * 실제 턴 진행(주사위 굴리기, 모달 버튼 클릭)은 main.js의 AI 드라이버가 담당한다.
 */

const AI_CONFIG = {
  cashReserve: 150,      // 이만큼은 남기고 국가를 산다
  quizCorrectRate: 0.6,  // AI가 퀴즈 정답을 맞히는 확률
  tryPurchaseQuizRate: 0.5, // 국가 도착 시 할인 퀴즈에 도전할 확률
};

/** 국가를 살지 결정. price는 (할인 적용된) 실제 지불 금액 */
function aiShouldBuy(player, price) {
  if (player.money < price) return false;
  return player.money - price >= AI_CONFIG.cashReserve;
}

/** 할인 퀴즈에 도전할지 — 지금 못 사거나(할인 시 살 수도), 가끔 재미로 */
function aiShouldTryPurchaseQuiz(player, fullPrice, discountedPrice) {
  const cannotAffordFull = player.money < fullPrice;
  const couldAffordDiscount = player.money >= discountedPrice;
  if (cannotAffordFull && couldAffordDiscount) return true;
  return Math.random() < AI_CONFIG.tryPurchaseQuizRate;
}

/** 퀴즈 보기 중 몇 번을 고를지. quizCorrectRate 확률로 정답, 아니면 무작위 */
function aiQuizChoiceIndex(quiz) {
  const correctIndex = quiz.choices.indexOf(quiz.answer);
  if (Math.random() < AI_CONFIG.quizCorrectRate && correctIndex >= 0) {
    return correctIndex;
  }
  return Math.floor(Math.random() * quiz.choices.length);
}

window.AI_CONFIG = AI_CONFIG;
window.aiShouldBuy = aiShouldBuy;
window.aiShouldTryPurchaseQuiz = aiShouldTryPurchaseQuiz;
window.aiQuizChoiceIndex = aiQuizChoiceIndex;
