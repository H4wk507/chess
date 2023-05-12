import { getNewBoard } from "./chessboard";
import { isKingAttacked } from "./kingLogic";
import {
  getLegalBishopMoves,
  getLegalKingMoves,
  getLegalKnightMoves,
  getLegalPawnMoves,
  getLegalQueenMoves,
  getLegalRookMoves,
} from "./legalMoves";
import { Chessboard, ISquare, PieceType, Position } from "./types";

export function isValidMoveUtil(
  getLegalMoves: (chessboard: Chessboard, src: ISquare) => Set<Position>,
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
) {
  const legalMoves = getLegalMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

export function isValidKingMoveToNotAttacked(
  src: ISquare,
  dst: Position,
): boolean {
  /* Check if the king's move is valid, we are assuming
   * that 'dst' position is not under attack.
   */
  const dx = Math.abs(dst.x - src.position.x);
  const dy = Math.abs(dst.y - src.position.y);
  return dx + dy === 1 || (dx + dy === 2 && dx === dy);
}

export function isValidMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare,
): boolean {
  if (dst.piece && dst.piece.color === src.piece?.color) {
    return false;
  }

  switch (src.piece?.type) {
    case PieceType.PAWN:
      if (!isValidMoveUtil(getLegalPawnMoves, chessboard, src, dst.position))
        return false;
      break;
    case PieceType.KNIGHT:
      if (!isValidMoveUtil(getLegalKnightMoves, chessboard, src, dst.position))
        return false;
      break;
    case PieceType.BISHOP:
      if (!isValidMoveUtil(getLegalBishopMoves, chessboard, src, dst.position))
        return false;
      break;
    case PieceType.ROOK:
      if (!isValidMoveUtil(getLegalRookMoves, chessboard, src, dst.position))
        return false;
      break;
    case PieceType.QUEEN:
      if (!isValidMoveUtil(getLegalQueenMoves, chessboard, src, dst.position))
        return false;
      break;
    case PieceType.KING:
      if (!isValidMoveUtil(getLegalKingMoves, chessboard, src, dst.position))
        return false;
      break;
  }
  const newChessboard = getNewBoard(chessboard, src, dst.position);
  return !isKingAttacked(newChessboard, src.piece?.color);
}
