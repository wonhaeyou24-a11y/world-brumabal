/**
 * piece.js
 * 말(토큰) 조회 및 렌더링 헬퍼.
 * 사진(assets/pieces/*.png)이 있으면 사진을, 없으면 이모지를 보여준다.
 * 사진 유무 판단은 <img onerror>로 처리하므로 별도 로딩 검사가 필요 없다.
 */

function getPieceById(id) {
  return (window.PIECES || []).find((p) => p.id === id) || (window.PIECES || [])[0] || null;
}

function getPieceByIndex(i) {
  const list = window.PIECES || [];
  return list[i % list.length] || null;
}

/** gameState의 player로부터 말 데이터를 얻는다 */
function playerPiece(player) {
  return getPieceById(player.pieceId);
}

/**
 * 말 하나를 그리는 HTML.
 * size: "sm" | "md" | "lg" (생략 시 md)
 * 사진이 없으면 img가 스스로 숨고 이모지가 보인다 (CSS: piece.css)
 */
function pieceMarkup(piece, size) {
  if (!piece) return "";
  const cls = "piece piece--" + (size || "md");
  return `<span class="${cls}" data-piece="${piece.id}" style="--piece-color:${piece.color}">
    <img class="piece-photo" src="${piece.image}" alt="${piece.label}" draggable="false"
         onerror="this.classList.add('is-missing')" />
    <span class="piece-fallback" aria-hidden="true">${piece.token}</span>
  </span>`;
}

window.getPieceById = getPieceById;
window.getPieceByIndex = getPieceByIndex;
window.playerPiece = playerPiece;
window.pieceMarkup = pieceMarkup;
