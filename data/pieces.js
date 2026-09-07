/**
 * pieces.js
 * 플레이어 말(토큰) 데이터.
 *
 * 말 사진을 넣으려면 assets/pieces/ 폴더에 아래 image 경로와 같은 파일명으로 저장하세요.
 *   assets/pieces/siu.png  dad.png  mom.png  friend.png
 * 파일이 없으면 자동으로 token(이모지)이 대신 표시됩니다. 엔진 코드는 수정할 필요 없습니다.
 *
 * PNG 권장: 정사각형, 배경 투명, 256x256 이상.
 */

const PIECES = [
  { id: "siu",    label: "시우", token: "🧒", color: "#FF7A59", image: "assets/pieces/siu.png" },
  { id: "dad",    label: "아빠", token: "👨", color: "#3DBBFF", image: "assets/pieces/dad.png" },
  { id: "mom",    label: "엄마", token: "👩", color: "#4CC97C", image: "assets/pieces/mom.png" },
  { id: "friend", label: "친구", token: "🐻", color: "#FFC94D", image: "" }, // 사진을 넣으려면 "assets/pieces/friend.png" 로 바꾸고 파일 저장
];

window.PIECES = PIECES;
