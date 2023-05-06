import { Color, Piece, PieceType, Position } from "./types";

export function pieceToSvg(piece?: Piece): string | null {
  if (piece === undefined) return null;

  let url = "";
  url += piece.color === Color.WHITE ? "w" : "b";
  switch (piece?.type) {
    case PieceType.PAWN:
      url += "P";
      break;
    case PieceType.KNIGHT:
      url += "N";
      break;
    case PieceType.BISHOP:
      url += "B";
      break;
    case PieceType.ROOK:
      url += "R";
      break;
    case PieceType.QUEEN:
      url += "Q";
      break;
    case PieceType.KING:
      url += "K";
      break;
  }
  return url + ".svg";
}

export function containsPosition(
  position: Position,
  positionSet: Set<Position>
): boolean {
  for (const pos of positionSet) {
    if (pos.x === position.x && pos.y === position.y) return true;
  }

  return false;
}
