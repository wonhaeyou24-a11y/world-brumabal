/**
 * quizzes.js
 * 국기/수도 퀴즈 설정 데이터.
 *
 * 퀴즈 문제 자체는 countries.js 데이터로 js/quiz.js가 자동 생성합니다
 * (정답 1개 + countries.js의 다른 나라에서 뽑은 오답 2개).
 * 따라서 나라를 추가하면 퀴즈도 자동으로 늘어납니다.
 *
 * 이 파일에서는 보상/난이도 등 "규칙 값"만 관리합니다.
 */

const QUIZ_CONFIG = {
  choiceCount: 3,          // 보기 개수 (정답 1 + 오답 2)
  eventReward: 15,         // 황금열쇠 퀴즈 정답 시 받는 돈 (만원)
  purchaseDiscountRate: 0.2, // 국가 도착 시 퀴즈 정답 → 구매가 할인율 (20%)
};

window.QUIZ_CONFIG = QUIZ_CONFIG;
