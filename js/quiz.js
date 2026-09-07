/**
 * quiz.js
 * 수도 / 국기 퀴즈 문제를 countries.js 데이터로 생성하고 채점한다.
 * DOM을 건드리지 않는다 — 화면 표시는 ui.js / main.js가 담당한다.
 *
 * 퀴즈 객체 형태:
 *   {
 *     type: "capital" | "flag",
 *     countryId: "JP",
 *     prompt: "🇯🇵 일본의 수도는 어디일까요?",
 *     choices: ["도쿄", "베이징", "방콕"],   // 순서 섞인 보기
 *     answer: "도쿄"
 *   }
 */

function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function _pickWrongCountries(country, count) {
  return _shuffle(getAllCountries().filter((c) => c.id !== country.id)).slice(0, count);
}

/** 특정 국가의 "수도 맞히기" 퀴즈를 만든다 */
function buildCapitalQuiz(country) {
  const wrongN = (window.QUIZ_CONFIG?.choiceCount ?? 3) - 1;
  const wrongs = _pickWrongCountries(country, wrongN).map((c) => c.capitalKo);
  return {
    type: "capital",
    countryId: country.id,
    prompt: `${country.flag} ${country.nameKo}의 수도는 어디일까요?`,
    choices: _shuffle([country.capitalKo, ...wrongs]),
    answer: country.capitalKo,
  };
}

/** 특정 국가의 "이 국기는 어느 나라?" 퀴즈를 만든다 */
function buildFlagQuiz(country) {
  const wrongN = (window.QUIZ_CONFIG?.choiceCount ?? 3) - 1;
  const wrongs = _pickWrongCountries(country, wrongN).map((c) => c.nameKo);
  return {
    type: "flag",
    countryId: country.id,
    prompt: `${country.flag}  이 국기는 어느 나라일까요?`,
    choices: _shuffle([country.nameKo, ...wrongs]),
    answer: country.nameKo,
  };
}

/** 국가 지정: 해당 국가의 수도 퀴즈 (국가 도착 시 사용) */
function getCapitalQuizForCountry(countryId) {
  const country = getCountryById(countryId);
  if (!country) return null;
  return buildCapitalQuiz(country);
}

/** 무작위 퀴즈 (이벤트 칸에서 사용). type 생략 시 수도/국기 랜덤 */
function getRandomQuiz(type) {
  const countries = getAllCountries();
  const country = countries[Math.floor(Math.random() * countries.length)];
  const chosen = type || (Math.random() < 0.5 ? "capital" : "flag");
  return chosen === "capital" ? buildCapitalQuiz(country) : buildFlagQuiz(country);
}

/** 채점 */
function isCorrectAnswer(quiz, choice) {
  return quiz.answer === choice;
}

window.buildCapitalQuiz = buildCapitalQuiz;
window.buildFlagQuiz = buildFlagQuiz;
window.getCapitalQuizForCountry = getCapitalQuizForCountry;
window.getRandomQuiz = getRandomQuiz;
window.isCorrectAnswer = isCorrectAnswer;
