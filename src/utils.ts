import { Color, ISquare, Piece, PieceType, Position } from "./types";

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
  positionSet: Set<Position>,
): boolean {
  for (const pos of positionSet) {
    if (pos.x === position.x && pos.y === position.y) return true;
  }

  return false;
}

export function positionEquals(p1: Position, p2: Position): boolean {
  return p1.y === p2.y && p1.x === p2.x;
}

function pieceEquals(p1?: Piece, p2?: Piece): boolean {
  if (p1 === undefined || p2 === undefined) return p1 === p2;

  return (
    p1.type === p2.type && p1.color === p2.color && p1.hasMoved === p2.hasMoved
  );
}

export function squareEquals(s1: ISquare, s2: ISquare): boolean {
  return (
    pieceEquals(s1.piece, s2.piece) && positionEquals(s1.position, s2.position)
  );
}
