/**
 * intro.js
 * 웹앱을 켜면 인트로 화면(포스터)이 표시된다.
 *
 * 동작 흐름:
 * 1) 앱 시작 → 인트로 화면 표시 (포스터 이미지 + 하단 "화면터치하여 시작" 안내)
 * 2) 첫 터치 → 음성과 함께 영상을 처음부터 재생, 안내가 "화면을 터치하면 넘어가요"로 변경
 * 3) 재생 중 터치 → 스킵하여 메인 화면으로 이동
 * 4) 영상이 끝나거나 재생 오류 → 자동으로 메인 화면으로 이동
 */

document.addEventListener("DOMContentLoaded", () => {
  const screen = document.getElementById("screen-intro");
  const video = document.getElementById("intro-video");
  const startBtn = document.getElementById("intro-sound");   // 중앙 버튼 (사용 안 함)
  const skipHint = document.getElementById("intro-skip");     // 하단 안내 텍스트
  const startScreen = document.getElementById("screen-start");
  if (!screen || !video) return;

  // --- 상태 플래그 ---
  let done = false;       // 인트로가 완료되어 메인 화면으로 넘어갔는지
  let playing = false;    // 영상이 음성과 함께 재생 중인지

  /**
   * 메인 화면(시작 화면)으로 전환
   */
  function goToStart() {
    if (done) return;
    done = true;
    try { video.pause(); } catch (e) { /* 안전 무시 */ }
    screen.classList.add("hidden");
    if (startScreen) startScreen.classList.remove("hidden");
    if (window.refreshContinueButton) window.refreshContinueButton();
  }

  /**
   * 음성과 함께 영상을 처음부터 재생
   * 사용자 제스처(터치/클릭) 내에서 호출해야 브라우저가 허용한다.
   */
  function playWithSound() {
    if (done || playing) return;
    try {
      if (window.unlockAudio) window.unlockAudio(); // 게임 효과음 AudioContext도 잠금 해제
      video.muted = false;
      video.currentTime = 0;
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          // 음성과 함께 재생 성공
          playing = true;
          if (skipHint) skipHint.textContent = "화면을 터치하면 넘어가요";
        }).catch(() => {
          // 재생 실패 → 메인 화면으로 이동
          goToStart();
        });
      } else {
        // Promise 미지원 구형 브라우저 → 재생된 것으로 간주
        playing = true;
        if (skipHint) skipHint.textContent = "화면을 터치하면 넘어가요";
      }
    } catch (e) {
      goToStart();
    }
  }

  // --- 초기 상태: 하단에 "화면터치하여 시작" 안내 표시 ---
  if (startBtn) startBtn.classList.add("hidden");  // 중앙 버튼은 숨김
  if (skipHint) {
    skipHint.textContent = "화면터치하여 시작";
    skipHint.classList.remove("hidden");
  }

  // --- 이벤트 리스너 ---

  // 영상 재생 완료 또는 에러 → 메인 화면으로
  video.addEventListener("ended", goToStart);
  video.addEventListener("error", goToStart);

  // 화면(인트로 섹션) 터치/클릭
  screen.addEventListener("click", () => {
    if (done) return;
    if (playing) {
      goToStart();    // 재생 중 → 스킵하여 메인 화면으로
    } else {
      playWithSound(); // 첫 터치 → 음성과 함께 재생
    }
  });
});

