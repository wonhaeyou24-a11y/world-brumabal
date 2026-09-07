/**
 * intro.js
 * 웹앱을 켜면 인트로 영상이 바로(음소거) 재생된다.
 * 가운데 "🔊 소리 켜기" 버튼을 누르면 처음부터 소리와 함께 다시 재생된다.
 * 재생 중 화면을 터치하면 영상을 건너뛰고 메인 화면으로 넘어간다.
 * 영상이 끝나도 메인 화면으로 넘어간다.
 */

document.addEventListener("DOMContentLoaded", () => {
  const screen = document.getElementById("screen-intro");
  const video = document.getElementById("intro-video");
  const soundBtn = document.getElementById("intro-sound");
  const skipBtn = document.getElementById("intro-skip");
  const startScreen = document.getElementById("screen-start");
  if (!screen || !video) return;

  let done = false;
  let soundOn = false;

  function goToStart() {
    if (done) return;
    done = true;
    try {
      video.pause();
    } catch (e) {}
    screen.classList.add("hidden");
    if (startScreen) startScreen.classList.remove("hidden");
    if (window.refreshContinueButton) window.refreshContinueButton();
  }

  function enableSound() {
    if (soundOn || done) return;
    soundOn = true;
    if (window.unlockAudio) window.unlockAudio(); // 게임 효과음도 함께 잠금 해제
    soundBtn.classList.add("hidden");
    skipBtn.classList.remove("hidden");
    video.muted = false;
    try {
      video.currentTime = 0;
    } catch (e) {}
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => goToStart());
  }

  // 음소거 자동재생 시작 (HTML autoplay 속성 + 보강)
  const first = video.play();
  if (first && typeof first.catch === "function") {
    first.catch(() => {
      // 음소거 자동재생마저 막히면 소리 버튼이 재생 버튼 역할
      soundBtn.querySelector(".intro-sound-text").textContent = "눌러서 재생";
    });
  }

  soundBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    enableSound();
  });

  // 재생 중 화면 아무 곳이나 터치하면 건너뛰기
  screen.addEventListener("click", goToStart);
  skipBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    goToStart();
  });

  video.addEventListener("ended", goToStart);
  video.addEventListener("error", goToStart);
});
