# 🌎 세계여행 브루마블

아이와 부모가 함께 즐기는 세계 나라·수도·국기 학습 보드게임 (모바일 웹 / PWA)

## 플레이

- 배포 주소: https://wonhaeyou24-a11y.github.io/world-brumabal/
- 로컬 실행: `index.html`을 브라우저로 열기 (또는 `python -m http.server` 후 접속 — 서비스워커/오프라인 캐싱은 http(s)에서만 동작)

## 게임 방법

1. 2~4명이 순서대로 주사위를 굴려 말을 이동합니다.
2. 도착한 나라가 비어 있으면 살 수 있습니다. **수도 퀴즈**를 맞히면 20% 할인.
3. 다른 사람의 나라에 도착하면 통행료를 냅니다.
4. **❓ 찬스 칸**에서는 보너스·비용·세계 퀴즈·무료 여행이 기다립니다.
5. 방문한 나라는 **🧳 여행 도감**에 모입니다 (게임이 끝나도 누적).
6. 정해진 턴(기본 24턴)이 끝나면 총 자산이 가장 많은 사람이 우승!

## 구조

```
data/      countries.js  나라 데이터 (여기에 객체만 추가하면 확장)
           events.js     찬스 칸 카드
           quizzes.js    퀴즈 규칙 값
js/        board.js game.js player.js property.js dice.js
           quiz.js event.js   STEP 5~6 퀴즈 / 찬스
           storage.js         localStorage 저장 + 여행 도감
           ui.js main.js      화면 렌더링 / 흐름 연결
css/       style.css board.css game.css mobile.css
```

엔진 코드(`js/`)는 나라 수가 바뀌어도 수정할 필요가 없도록 데이터와 분리되어 있습니다.

## 배포

`git push` 하면 GitHub Pages(main 브랜치 루트)가 자동 빌드합니다.
**JS/CSS를 수정했다면 `service-worker.js`의 `CACHE_VERSION` 숫자를 올려야** 사용자에게 갱신이 반영됩니다.
(HTML 진입은 네트워크 우선이라 즉시 반영, 정적 리소스는 캐시 우선)
