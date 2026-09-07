/**
 * sound.js
 * 효과음 재생. 지금은 오디오 파일 없이 Web Audio API로 간단한 음을 합성한다.
 * 나중에 /assets/sounds/ 에 실제 음원을 넣으면 playSound 내부만 교체하면 된다.
 *
 * 브라우저 자동재생 정책 때문에 첫 사용자 인터랙션 때 unlockAudio()를 호출해야 한다.
 */

let _audioCtx = null;
let _unlocked = false;

function _ctx() {
  if (!_audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _audioCtx = new AC();
  }
  return _audioCtx;
}

/** 첫 사용자 제스처에서 호출 — 오디오 컨텍스트 잠금 해제 */
function unlockAudio() {
  const ctx = _ctx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  _unlocked = true;
}

/** 단음 하나를 재생 */
function _tone(freq, startAt, dur, type = "sine", gainPeak = 0.18) {
  const ctx = _ctx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + startAt;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// 효과음 정의: 음 높이(Hz) 시퀀스
const SOUND_PATTERNS = {
  dice:        { notes: [[330, 0, 0.06, "square"], [440, 0.07, 0.06, "square"], [392, 0.14, 0.06, "square"]] },
  move:        { notes: [[523, 0, 0.05, "triangle", 0.12]] },
  land:        { notes: [[392, 0, 0.08, "triangle", 0.16], [262, 0.06, 0.12, "triangle", 0.14]] },
  buy:         { notes: [[523, 0, 0.09], [659, 0.09, 0.09], [784, 0.18, 0.14]] },
  coinGain:    { notes: [[784, 0, 0.07, "triangle"], [1047, 0.08, 0.12, "triangle"]] },
  coinLoss:    { notes: [[392, 0, 0.1, "sawtooth", 0.14], [294, 0.1, 0.16, "sawtooth", 0.14]] },
  quizCorrect: { notes: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.2]] },
  quizWrong:   { notes: [[330, 0, 0.18, "sawtooth", 0.13], [247, 0.18, 0.28, "sawtooth", 0.13]] },
  win:         { notes: [[523, 0, 0.14], [659, 0.14, 0.14], [784, 0.28, 0.14], [1047, 0.42, 0.36]] },
  // 국가 구입 — 팡파레
  buyFanfare:  { notes: [
    [523, 0, 0.12, "square", 0.2], [659, 0.12, 0.12, "square", 0.2], [784, 0.24, 0.12, "square", 0.2],
    [1047, 0.36, 0.28, "square", 0.24], [784, 0.36, 0.28, "triangle", 0.16], [1319, 0.5, 0.3, "triangle", 0.2],
  ] },
  // 통행료 — 쿵 + 동전 떨어지는 느낌
  rentImpact:  { notes: [
    [196, 0, 0.16, "sawtooth", 0.26], [147, 0.05, 0.22, "sawtooth", 0.22],
    [440, 0.2, 0.06, "triangle", 0.14], [330, 0.3, 0.06, "triangle", 0.14], [262, 0.4, 0.14, "triangle", 0.14],
  ] },
};

/** 효과음 재생. 소리 설정이 꺼져 있거나 잠금 해제 전이면 조용히 무시 */
function playSound(name) {
  if (!window.isSoundOn || !window.isSoundOn()) return;
  if (!_unlocked) return;
  const pattern = SOUND_PATTERNS[name];
  if (!pattern) return;
  try {
    pattern.notes.forEach(([f, at, dur, type, peak]) => _tone(f, at, dur, type, peak));
  } catch (err) {
    /* 오디오 오류는 게임 진행에 영향 주지 않음 */
  }
}

window.unlockAudio = unlockAudio;
window.playSound = playSound;
