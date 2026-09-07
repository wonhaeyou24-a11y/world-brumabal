/**
 * intro.js
 * 웹앱을 켜면 인트로 영상을 "소리와 함께 처음부터" 재생한다.
 *  - 브라우저가 소리 있는 자동재생을 허용하면 바로 재생된다.
 *  - 막히면 첫 장면(포스터)에 "▶ 눌러서 시작" 버튼이 떠서, 누르면 그때 소리와 함께
 *    처음부터 재생된다. (음소거로 미리 틀지 않으므로 되감기는 느낌이 없다)
 *  - 재생 중 화면을 터치하면 건너뛰고 메인 화면으로 넘어간다.
 *  - 영상이 끝나거나 재생 오류가 나면 메인 화면으로 넘어간다.
 */

document.addEventListener("DOMContentLoaded", () => {
  const screen = document.getElementById("screen-intro");
  const video = document.getElementById("intro-video");
  const startBtn = document.getElementById("intro-sound"); // "▶ 눌러서 시작"
  const skipHint = document.getElementById("intro-skip");  // "화면을 터치하면 넘어가요"
  const startScreen = document.getElementById("screen-start");
  if (!screen || !video) return;

  let done = false;
  let playing = false;

  function goToStart() {
    if (done) return;
    done = true;
    try { video.pause(); } catch (e) {}
    screen.classList.add("hidden");
    if (startScreen) startScreen.classList.remove("hidden");
    if (window.refreshContinueButton) window.refreshContinueButton();
  }

  function markPlaying() {
    if (playing) return;
    playing = true;
    if (startBtn) startBtn.classList.add("hidden");
    if (skipHint) skipHint.classList.remove("hidden");
  }

  // 소리와 함께 처음부터 재생 시도 (currentTime은 건드리지 않는다)
  function tryPlay() {
    if (done) return;
    if (window.unlockAudio) window.unlockAudio(); // 게임 효과음도 함께 잠금 해제
    video.muted = false;
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(markPlaying).catch(() => {
        if (startBtn) startBtn.classList.remove("hidden");
      });
    }
  }

  tryPlay();

  // 자동재생이 막혔으면 잠깐 뒤에 "눌러서 시작" 버튼을 띄운다 (포스터가 보이는 동안)
  setTimeout(() => {
    if (!playing && !done && startBtn) startBtn.classList.remove("hidden");
  }, 300);

  // 재생이 실제로 시작되면 안내 전환
  video.addEventListener("playing", markPlaying);
  video.addEventListener("ended", goToStart);
  video.addEventListener("error", goToStart);

  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tryPlay();
    });
  }

  // 첫 탭 = 재생 시작 / 재생 중 탭 = 건너뛰기
  screen.addEventListener("click", () => {
    if (!playing) tryPlay();
    else goToStart();
  });
});
