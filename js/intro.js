/**
 * intro.js
 * 웹앱을 켜면 인트로 영상을 "소리와 함께 처음부터" 재생한다.
 *  - 브라우저가 소리 있는 자동재생을 허용하면 바로 재생된다.
 *  - 막히면 첫 장면(포스터)에 "▶ 눌러서 시작" 버튼이 떠서, 누르면 그때 소리와 함께
 *    처음부터 재생된다. (음소거로 미리 틀지 않으므로 되감기는 느낌이 없다)
 *  - 재생이 "실제로 시작된 뒤"에 화면을 터치하면 건너뛰고 메인 화면으로 넘어간다.
 *    (재생 전 터치는 '재생 시작'으로 동작 — 실수로 인트로가 스킵되지 않게)
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
  let started = false;   // 영상이 실제로 재생되기 시작했는지 (playing 이벤트로만 true)
  let userTapped = false; // 사용자가 시작하려고 한 번 눌렀는지

  function goToStart() {
    if (done) return;
    done = true;
    try { video.pause(); } catch (e) {}
    screen.classList.add("hidden");
    if (startScreen) startScreen.classList.remove("hidden");
    if (window.refreshContinueButton) window.refreshContinueButton();
  }

  // 재생이 "정말" 시작됐을 때만 호출 — 이때부터 터치는 건너뛰기로 동작
  function onReallyPlaying() {
    if (started || done) return;
    started = true;
    if (startBtn) startBtn.classList.add("hidden");
    if (skipHint) skipHint.classList.remove("hidden");
  }

  // 소리와 함께 처음부터 재생 시도 (currentTime은 건드리지 않는다 → 되감기는 느낌 없음)
  function attemptPlay() {
    if (done) return;
    if (window.unlockAudio) window.unlockAudio(); // 게임 효과음도 함께 잠금 해제
    video.muted = false;
    const p = video.play();
    // 주의: play()의 Promise가 resolve돼도 실제로는 정책상 멈춰 있을 수 있으므로
    // 여기서 started를 true로 만들지 않는다. 진짜 신호는 'playing' 이벤트다.
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  attemptPlay();

  // 자동재생이 안 됐으면 잠깐 뒤에 "눌러서 시작" 버튼을 띄운다 (포스터가 보이는 동안)
  setTimeout(() => {
    if (!started && !done && startBtn) startBtn.classList.remove("hidden");
  }, 500);

  // 진짜 재생 신호들
  video.addEventListener("playing", onReallyPlaying);
  video.addEventListener("timeupdate", () => {
    if (video.currentTime > 0.4 && !video.paused) onReallyPlaying();
  });
  video.addEventListener("ended", goToStart);
  video.addEventListener("error", goToStart);

  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userTapped = true;
      attemptPlay();
      // 이 기기가 영상을 정말 못 틀면 잠시 뒤 화면 터치로 건너뛸 수 있게 안내
      setTimeout(() => {
        if (!started && !done && skipHint) skipHint.classList.remove("hidden");
      }, 1200);
    });
  }

  screen.addEventListener("click", () => {
    if (done) return;
    if (started) {
      goToStart();        // 재생 중 → 건너뛰기
      return;
    }
    if (!userTapped) {
      userTapped = true;  // 첫 화면 터치 → 재생 시작 시도
      attemptPlay();
      setTimeout(() => {
        if (!started && !done && skipHint) skipHint.classList.remove("hidden");
      }, 1200);
      return;
    }
    goToStart();          // 두 번째 터치부터는(재생이 안 되면) 건너뛰기 허용
  });
});
