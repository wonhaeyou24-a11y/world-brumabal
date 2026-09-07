/**
 * intro.js
 * 시작 시 레고 인트로 영상을 재생하고, 끝나거나 화면을 터치하면 메인 화면으로 넘어간다.
 * 브라우저 자동재생 정책상 소리 있는 영상은 사용자 제스처가 필요하므로,
 * "눌러서 시작" 버튼을 한 번 누르면 소리와 함께 재생한다.
 * 한 번 본 뒤에는 바로 메인으로 가고, 시작 화면의 "인트로 다시보기"로 언제든 다시 볼 수 있다.
 */

const INTRO_SEEN_KEY = "worldBrumabal_introSeen_v1";

document.addEventListener("DOMContentLoaded", () => {
  const screen = document.getElementById("screen-intro");
  const video = document.getElementById("intro-video");
  const startBtn = document.getElementById("intro-start");
  const skipBtn = document.getElementById("intro-skip");
  const startScreen = document.getElementById("screen-start");
  if (!screen || !video) return;

  let done = false;
  let started = false;

  const introSeen = (() => {
    try {
      return window.localStorage.getItem(INTRO_SEEN_KEY) === "1";
    } catch (e) {
      return false;
    }
  })();

  function markSeen() {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch (e) {}
  }

  function goToStart() {
    if (done) return;
    done = true;
    if (started) markSeen(); // 재생을 시작했으면(끝까지 보든 건너뛰든) 다음부터 생략
    try {
      video.pause();
    } catch (e) {}
    screen.classList.add("hidden");
    if (startScreen) startScreen.classList.remove("hidden");
    if (window.refreshContinueButton) window.refreshContinueButton();
  }

  function beginPlayback() {
    if (started) return;
    started = true;
    if (window.unlockAudio) window.unlockAudio(); // 게임 효과음도 함께 잠금 해제
    startBtn.classList.add("hidden");
    skipBtn.classList.remove("hidden");
    video.muted = false;
    try {
      video.currentTime = 0;
    } catch (e) {}
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => goToStart());
  }

  // 인트로를 처음 여는 함수 (시작 화면의 "다시보기" 버튼에서도 사용)
  function openIntro() {
    done = false;
    started = false;
    screen.classList.remove("hidden");
    startBtn.classList.remove("hidden");
    skipBtn.classList.add("hidden");
    if (startScreen) startScreen.classList.add("hidden");
  }
  window.openIntro = openIntro;

  const replayBtn = document.getElementById("btn-replay-intro");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      openIntro();
      beginPlayback(); // 버튼 클릭이 사용자 제스처이므로 소리와 함께 바로 재생
    });
  }

  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    beginPlayback();
  });
  screen.addEventListener("click", () => {
    if (started) goToStart();
  });
  skipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    goToStart();
  });
  video.addEventListener("ended", goToStart);
  video.addEventListener("error", goToStart);

  // 이미 한 번 봤으면 인트로를 건너뛰고 바로 시작 화면
  if (introSeen) {
    goToStart();
  }
});
