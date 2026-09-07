/**
 * storage.js
 * 게임 상태 저장/불러오기.
 * 지금은 localStorage를 사용하지만, 이 파일만 교체하면
 * 향후 IndexedDB 등 다른 저장소로 바꿀 수 있도록 인터페이스를 분리했다.
 */

const SAVE_KEY = "worldBrumabal_saveData_v1";
const TRAVEL_LOG_KEY = "worldBrumabal_travelLog_v1";

function saveGame(gameState) {
  try {
    const payload = JSON.stringify({
      ...gameState,
      lastSavedAt: new Date().toISOString(),
    });
    window.localStorage.setItem(SAVE_KEY, payload);
    return true;
  } catch (err) {
    console.error("저장 실패:", err);
    return false;
  }
}

function loadGame() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("불러오기 실패(저장 데이터 손상 가능):", err);
    return null;
  }
}

function hasSavedGame() {
  return window.localStorage.getItem(SAVE_KEY) !== null;
}

function clearSavedGame() {
  window.localStorage.removeItem(SAVE_KEY);
}

/* ---------------------------------------------------------
   여행 도감 (게임이 끝나도 남는 누적 방문 기록)
   형태: { [countryId]: 방문횟수 }
--------------------------------------------------------- */
function loadTravelLog() {
  try {
    const raw = window.localStorage.getItem(TRAVEL_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("여행 도감 불러오기 실패:", err);
    return {};
  }
}

function addToTravelLog(countryId) {
  try {
    const log = loadTravelLog();
    log[countryId] = (log[countryId] || 0) + 1;
    window.localStorage.setItem(TRAVEL_LOG_KEY, JSON.stringify(log));
    return log;
  } catch (err) {
    console.error("여행 도감 저장 실패:", err);
    return null;
  }
}

function clearTravelLog() {
  window.localStorage.removeItem(TRAVEL_LOG_KEY);
}

window.saveGame = saveGame;
window.loadGame = loadGame;
window.hasSavedGame = hasSavedGame;
window.clearSavedGame = clearSavedGame;
window.loadTravelLog = loadTravelLog;
window.addToTravelLog = addToTravelLog;
window.clearTravelLog = clearTravelLog;
