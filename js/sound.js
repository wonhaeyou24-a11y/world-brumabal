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
  // 주사위가 구르는 동안 — 달그락달그락
  diceRoll:    { notes: [
    [200, 0, 0.03, "square", 0.1], [170, 0.06, 0.03, "square", 0.1], [250, 0.12, 0.03, "square", 0.1],
    [190, 0.19, 0.03, "square", 0.1], [240, 0.27, 0.03, "square", 0.1], [180, 0.36, 0.03, "square", 0.1],
    [230, 0.46, 0.03, "square", 0.1], [200, 0.56, 0.03, "square", 0.1], [260, 0.68, 0.03, "square", 0.1],
  ] },
  move:        { notes: [[523, 0, 0.05, "triangle", 0.12]] },
  // 칸을 한 칸씩 폴짝 — 짧은 블립(올라가며)
  step:        { notes: [[520, 0, 0.035, "sine", 0.12], [700, 0.04, 0.045, "sine", 0.1]] },
  land:        { notes: [[392, 0, 0.08, "triangle", 0.16], [262, 0.06, 0.12, "triangle", 0.14]] },
  // 무언가 입체적으로 "뿅" 튀어나올 때 (쉼터/황금열쇠)
  pop:         { notes: [[300, 0, 0.05, "sine", 0.18], [520, 0.05, 0.06, "sine", 0.18], [430, 0.13, 0.12, "sine", 0.13]] },
  // 쉼터 — 햄버거 냠냠 (경쾌하게 상승)
  restStop:    { notes: [
    [392, 0, 0.09, "triangle", 0.16], [523, 0.09, 0.09, "triangle", 0.16],
    [659, 0.18, 0.1, "sine", 0.16], [784, 0.28, 0.16, "sine", 0.14],
  ] },
  // 황금열쇠 — 반짝반짝
  keyReveal:   { notes: [
    [1047, 0, 0.06, "sine", 0.14], [1319, 0.07, 0.06, "sine", 0.14],
    [1568, 0.14, 0.09, "sine", 0.14], [2093, 0.22, 0.18, "sine", 0.11],
  ] },
  // 버튼/선택 — 딸깍
  select:      { notes: [[880, 0, 0.02, "square", 0.07], [1175, 0.02, 0.03, "square", 0.06]] },
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
  // 통행료 — 경보 사이렌 + 쿵! + 동전 우수수 (재미 포인트)
  rentImpact:  { notes: [
    [880, 0, 0.14, "sawtooth", 0.2], [640, 0.14, 0.16, "sawtooth", 0.2],
    [880, 0.32, 0.14, "sawtooth", 0.2], [640, 0.46, 0.16, "sawtooth", 0.2],
    [110, 0.64, 0.3, "sawtooth", 0.32], [80, 0.68, 0.34, "sawtooth", 0.26],
    [1047, 0.86, 0.05, "triangle", 0.13], [880, 0.94, 0.05, "triangle", 0.12],
    [1175, 1.02, 0.05, "triangle", 0.13], [784, 1.1, 0.14, "triangle", 0.12],
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
