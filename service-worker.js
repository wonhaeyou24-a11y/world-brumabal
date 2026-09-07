/**
 * service-worker.js
 * 정적 리소스를 캐싱하여 오프라인에서도 기본 게임 플레이가 가능하도록 한다.
 * CACHE_VERSION을 올리면 이전 캐시를 지우고 새 리소스로 교체한다(업데이트 안 되는 문제 방지).
 */

const CACHE_VERSION = "world-brumabal-v10";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./css/piece.css",
  "./css/board.css",
  "./css/game.css",
  "./css/mobile.css",
  "./css/tablet.css",
  "./data/countries.js",
  "./data/pieces.js",
  "./data/events.js",
  "./data/quizzes.js",
  "./js/country.js",
  "./js/piece.js",
  "./js/player.js",
  "./js/board.js",
  "./js/dice.js",
  "./js/property.js",
  "./js/quiz.js",
  "./js/event.js",
  "./js/ai.js",
  "./js/settings.js",
  "./js/sound.js",
  "./js/storage.js",
  "./js/game.js",
  "./js/ui.js",
  "./js/main.js",
  "./js/intro.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/pieces/siu.png",
  "./assets/pieces/dad.png",
  "./assets/pieces/mom.png",
  "./assets/intro/intro-poster.jpg",
];

// 설치 시점에 필수는 아니지만 있으면 캐시해 두는 것(용량 큰 영상 등) — 실패해도 설치는 계속
const EXTRA_ASSETS = ["./assets/intro/intro.mp4"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        cache.addAll(CORE_ASSETS).then(() =>
          // 큰 부가 리소스는 개별적으로, 실패는 무시
          Promise.all(EXTRA_ASSETS.map((url) => cache.add(url).catch(() => {})))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const req = event.request;
  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  // HTML(화면 진입)은 네트워크 우선 → 배포 즉시 반영, 오프라인이면 캐시로 폴백
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // 그 외 정적 리소스는 캐시 우선
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          // 206(부분 응답, 영상 스트리밍 등)이나 오류 응답은 캐시하지 않는다
          if (response && response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
