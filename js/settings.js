/**
 * settings.js
 * 게임 전체에 적용되는 사용자 환경설정(소리 on/off, 애니메이션 on/off)을
 * localStorage에 저장/복원한다. 게임 진행 데이터(gameState)와는 별개다.
 */

const SETTINGS_KEY = "worldBrumabal_settings_v1";

const DEFAULT_SETTINGS = {
  soundOn: true,
  animOn: true,
  hardQuiz: false, // false=보기 3개(쉬움), true=보기 4개(어려움)
};

function loadSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch (err) {
    console.warn("환경설정 불러오기 실패, 기본값 사용:", err);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(patch) {
  const next = { ...loadSettings(), ...patch };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("환경설정 저장 실패:", err);
  }
  applySettingsToDocument(next);
  return next;
}

/** prefers-reduced-motion 이거나 사용자가 애니메이션을 끈 경우 true */
function prefersReducedAnim() {
  if (!loadSettings().animOn) return true;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function isSoundOn() {
  return loadSettings().soundOn;
}

/** 퀴즈 보기 개수 (쉬움 3 / 어려움 4) */
function quizChoiceCount() {
  return loadSettings().hardQuiz ? 4 : (window.QUIZ_CONFIG?.choiceCount ?? 3);
}

/** body 클래스로 CSS 애니메이션 on/off를 반영 */
function applySettingsToDocument(settings = loadSettings()) {
  document.body.classList.toggle("no-anim", !settings.animOn);
}

window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.prefersReducedAnim = prefersReducedAnim;
window.isSoundOn = isSoundOn;
window.quizChoiceCount = quizChoiceCount;
window.applySettingsToDocument = applySettingsToDocument;
