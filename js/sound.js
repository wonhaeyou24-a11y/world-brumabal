/**
 * sound.js
 * 고품질 리얼 오디오(BGM 및 실제 효과음 파일) 재생 엔진.
 *
 * 주요 기능:
 *  1. BGM: 닌텐도풍 어쿠스틱 여행 테마 음악(Off to Osaka) 끊김 없는 루프 재생
 *  2. SFX: 실제 주사위 달그락, 동전 짤랑, 카툰 깡총 도약, 팡파레 등 고음질 오디오 파일 재생
 *  3. Fallback: 오디오 파일 로딩 불가 시 Web Audio 오실레이터 자동 폴백 (Zero-Crash Policy)
 *  4. 편의성: BGM 및 SFX 온/오프 토글 지원
 */

let _audioCtx = null;
let _unlocked = false;
let _bgmAudio = null;
let _bgmEnabled = true;

// 로컬 저장소에서 BGM 설정 복원
try {
  const savedBgm = localStorage.getItem("brumabal_bgm_enabled");
  if (savedBgm !== null) {
    _bgmEnabled = savedBgm === "1";
  }
} catch (e) {
  _bgmEnabled = true;
}

// 오디오 파일 매핑 (고품질 리얼 오디오)
const AUDIO_FILE_MAP = {
  diceRoll: "assets/sounds/dice_roll.wav",
  dice: "assets/sounds/dice_land.wav",
  step: "assets/sounds/token_hop.wav",
  heavyLand: "assets/sounds/heavy_land.wav",
  land: "assets/sounds/heavy_land.wav",
  coinGain: "assets/sounds/coin.wav",
  coinLoss: "assets/sounds/coin.wav",
  build: "assets/sounds/build.wav",
  buildLandmark: "assets/sounds/fanfare.wav",
  doubleFanfare: "assets/sounds/fanfare.wav",
  win: "assets/sounds/fanfare.wav",
  keyReveal: "assets/sounds/windchime.wav",
  planeFly: "assets/sounds/airplane.wav",
  select: "assets/sounds/click.wav",
  buy: "assets/sounds/coin.wav",
  buyFanfare: "assets/sounds/fanfare.wav",
  welfareJackpot: "assets/sounds/fanfare.wav",
  islandDrop: "assets/sounds/heavy_land.wav",
  restStop: "assets/sounds/wood_tap.wav",
};

// 지연 없는 즉각 재생을 위한 오디오 객체 캐시 풀
const _audioPool = {};

function _getAudioInstance(name) {
  const src = AUDIO_FILE_MAP[name];
  if (!src) return null;
  if (!_audioPool[name]) {
    _audioPool[name] = [];
  }
  // 사용 가능한 오디오 인스턴스 검색 (최대 4개 풀)
  for (const aud of _audioPool[name]) {
    if (aud.paused || aud.ended) {
      aud.currentTime = 0;
      return aud;
    }
  }
  if (_audioPool[name].length < 4) {
    const aud = new Audio(src);
    _audioPool[name].push(aud);
    return aud;
  }
  const aud = _audioPool[name][0];
  aud.currentTime = 0;
  return aud;
}

function _ctx() {
  if (!_audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _audioCtx = new AC();
  }
  return _audioCtx;
}

/** 첫 사용자 제스처(클릭/터치) 시 오디오 언락 및 BGM 시작 */
function unlockAudio() {
  const ctx = _ctx();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
  _unlocked = true;

  // BGM 자동 시작
  if (_bgmEnabled && (!_bgmAudio || _bgmAudio.paused)) {
    startBGM();
  }
}

/** BGM 초기화 및 재생 */
function initBGM() {
  if (_bgmAudio) return;
  try {
    _bgmAudio = new Audio("assets/sounds/bgm_travel.ogg");
    _bgmAudio.loop = true;
    _bgmAudio.volume = 0.32; // 은은하고 편안한 볼륨
  } catch (e) {
    // 무중단 보장
  }
}

function startBGM() {
  if (!_bgmEnabled) return;
  initBGM();
  if (_bgmAudio) {
    _bgmAudio.play().catch(() => {
      /* 사용자 인터랙션 대기 */
    });
  }
  updateBgmButtonUI();
}

function pauseBGM() {
  if (_bgmAudio) {
    _bgmAudio.pause();
  }
  updateBgmButtonUI();
}

function toggleBGM() {
  unlockAudio();
  _bgmEnabled = !_bgmEnabled;
  try {
    localStorage.setItem("brumabal_bgm_enabled", _bgmEnabled ? "1" : "0");
  } catch (e) {}

  if (_bgmEnabled) {
    startBGM();
  } else {
    pauseBGM();
  }
  return _bgmEnabled;
}

function updateBgmButtonUI() {
  const btn = document.getElementById("btn-toggle-bgm");
  if (!btn) return;
  const isPlaying = _bgmEnabled && _bgmAudio && !_bgmAudio.paused;
  btn.textContent = isPlaying ? "🎵" : "🔇";
  btn.title = isPlaying ? "배경음악 끄기" : "배경음악 켜기";
  btn.classList.toggle("is-active", isPlaying);
}

/** Web Audio 비상 폴백 단음 합성 (파일이 없을 때) */
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

const SOUND_PATTERNS = {
  dice:        { notes: [[330, 0, 0.06, "square"], [440, 0.07, 0.06, "square"], [392, 0.14, 0.06, "square"]] },
  diceRoll:    { notes: [[200, 0, 0.03, "square", 0.1], [250, 0.12, 0.03, "square", 0.1], [220, 0.25, 0.03, "square", 0.1]] },
  step:        { notes: [[440, 0, 0.035, "sine", 0.15], [640, 0.035, 0.045, "sine", 0.13]] },
  heavyLand:   { notes: [[180, 0, 0.08, "triangle", 0.3], [110, 0.04, 0.14, "sine", 0.35], [60, 0.09, 0.2, "sine", 0.4]] },
  doubleFanfare: { notes: [[523, 0, 0.08, "triangle", 0.22], [659, 0.08, 0.08, "triangle", 0.22], [784, 0.16, 0.1, "triangle", 0.24], [1047, 0.26, 0.22, "square", 0.28]] },
  keyReveal:   { notes: [[1047, 0, 0.06, "sine", 0.14], [1319, 0.07, 0.06, "sine", 0.14], [1568, 0.14, 0.09, "sine", 0.14], [2093, 0.22, 0.18, "sine", 0.11]] },
};

/**
 * 효과음 재생 함수.
 * 1순위: 실제 오디오 파일(.wav) 재생
 * 2순위: 실패 시 Web Audio 폴백
 */
function playSound(name) {
  if (window.isSoundOn && !window.isSoundOn()) return;

  // 1순위: 리얼 오디오 파일 재생
  const aud = _getAudioInstance(name);
  if (aud) {
    try {
      aud.volume = (name === "heavyLand" || name === "diceRoll") ? 0.85 : 0.65;
      aud.play().catch(() => {
        _fallbackPlayTone(name);
      });
      return;
    } catch (e) {
      // 폴백으로 전환
    }
  }

  // 2순위: Web Audio 폴백
  _fallbackPlayTone(name);
}

function _fallbackPlayTone(name) {
  if (!_unlocked) return;
  const pattern = SOUND_PATTERNS[name];
  if (!pattern) return;
  try {
    pattern.notes.forEach(([f, at, dur, type, peak]) => _tone(f, at, dur, type, peak));
  } catch (err) {}
}

window.unlockAudio = unlockAudio;
window.playSound = playSound;
window.startBGM = startBGM;
window.pauseBGM = pauseBGM;
window.toggleBGM = toggleBGM;
window.updateBgmButtonUI = updateBgmButtonUI;
