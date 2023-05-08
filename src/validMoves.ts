import { getNewBoard } from "./chessboard";
import { getKingPosition, isKingAttacked } from "./kingLogic";
import {
  getLegalBishopMoves,
  getLegalKingMoves,
  getLegalKnightMoves,
  getLegalPawnMoves,
  getLegalQueenMoves,
  getLegalRookMoves,
} from "./legalMoves";
import { Chessboard, ISquare, PieceType, Position } from "./types";

export function isValidRookMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): boolean {
  const legalMoves = getLegalRookMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

export function isValidBishopMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): boolean {
  const legalMoves = getLegalBishopMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

export function isValidKingMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): boolean {
  // TODO: castle
  const legalMoves = getLegalKingMoves(chessboard, src);
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

export function isValidKnightMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): boolean {
  const legalMoves = getLegalKnightMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

export function isValidQueenMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): boolean {
  const legalMoves = getLegalQueenMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

export function isValidPawnMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): boolean {
  // TODO: en passant
  const legalMoves = getLegalPawnMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
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
      if (!isValidPawnMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.KNIGHT:
      if (!isValidKnightMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.BISHOP:
      if (!isValidBishopMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.ROOK:
      if (!isValidRookMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.QUEEN:
      if (!isValidQueenMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.KING:
      if (!isValidKingMove(chessboard, src, dst.position)) return false;
      break;
  }
  const newChessboard = getNewBoard(chessboard, src, dst.position);
  const kingSquare = getKingPosition(newChessboard, src.piece?.color);
  return !isKingAttacked(newChessboard, kingSquare);
}
