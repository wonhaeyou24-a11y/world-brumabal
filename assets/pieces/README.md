# 말(플레이어 토큰) 사진

| 파일 | 말 | 상태 |
|---|---|---|
| `siu.png` | 시우 (말 1) | ✅ 사진 있음 |
| `dad.png` | 아빠 (말 2) | ✅ 사진 있음 |
| `mom.png` | 엄마 (말 3) | ✅ 사진 있음 |
| `friend.png` | 친구 (말 4) | ⬜ 없음 → 🐻 이모지로 표시 |

## 사진을 바꾸거나 추가하려면
1. 이 폴더에 `siu.png` / `dad.png` / `mom.png` / `friend.png` 로 저장 (정사각형, 512px 이상 권장, 원형으로 잘려서 표시됨)
2. `friend.png` 를 새로 넣는 경우 `data/pieces.js` 에서
   `image: ""` → `image: "assets/pieces/friend.png"` 로 바꾸고,
   `service-worker.js` 의 CORE_ASSETS 에 `"./assets/pieces/friend.png"` 한 줄 추가
3. `git add -A && git commit -m "말 사진" && git push`

파일명·개수·색은 `data/pieces.js` 에서 관리합니다.
