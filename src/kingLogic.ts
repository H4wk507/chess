import { getNewBoard } from "./chessboard";
import {
  getLegalPawnMoves,
  getLegalKnightMoves,
  getLegalBishopMoves,
  getLegalRookMoves,
  getLegalQueenMoves,
  getLegalKingMoves,
} from "./legalMoves";
import { Chessboard, Color, ISquare, PieceType, Position } from "./types";
import {
  isValidBishopMove,
  isValidKingMoveToNotAttacked,
  isValidKnightMove,
  isValidPawnMove,
  isValidQueenMove,
  isValidRookMove,
} from "./validMoves";

export function getKingPosition(
  chessboard: Chessboard,
  color?: Color
): ISquare {
  const kingSquare = chessboard
    .flat()
    .find(
      (square) =>
        square.piece?.type === PieceType.KING && square.piece?.color === color
    );
  if (kingSquare !== undefined) return kingSquare;

  return { piece: undefined, position: { x: -1, y: -1 } };
}

export function isKingAttacked(
  chessboard: Chessboard,
  kingSquare: ISquare
): boolean {
  return chessboard.flat().some((square) => {
    if (square.piece?.color === kingSquare.piece?.color) {
      return false;
    }
    switch (square.piece?.type) {
      case PieceType.PAWN:
        return isValidPawnMove(chessboard, square, kingSquare.position);
      case PieceType.KNIGHT:
        return isValidKnightMove(chessboard, square, kingSquare.position);
      case PieceType.BISHOP:
        return isValidBishopMove(chessboard, square, kingSquare.position);
      case PieceType.ROOK:
        return isValidRookMove(chessboard, square, kingSquare.position);
      case PieceType.QUEEN:
        return isValidQueenMove(chessboard, square, kingSquare.position);
      case PieceType.KING:
        return isValidKingMoveToNotAttacked(square, kingSquare.position);
    }
  });
}

export function isMated(chessboard: Chessboard, color: Color) {
  /* Check if 'color' player is mated. */
  const kingSquare = getKingPosition(chessboard, color);
  if (!isKingAttacked(chessboard, kingSquare)) {
    return false;
  }
  for (const row of chessboard) {
    for (const square of row) {
      if (square.piece?.color !== color) continue;
      let moves = new Set<Position>();
      switch (square.piece.type) {
        case PieceType.PAWN:
          moves = getLegalPawnMoves(chessboard, square);
          break;
        case PieceType.KNIGHT:
          moves = getLegalKnightMoves(chessboard, square);
          break;
        case PieceType.BISHOP:
          moves = getLegalBishopMoves(chessboard, square);
          break;
        case PieceType.ROOK:
          moves = getLegalRookMoves(chessboard, square);
          break;
        case PieceType.QUEEN:
          moves = getLegalQueenMoves(chessboard, square);
          break;
        case PieceType.KING:
          moves = getLegalKingMoves(chessboard, square);
          break;
      }
      for (const move of moves) {
        const newChessboard = getNewBoard(chessboard, square, move);
        const kingSquare = getKingPosition(chessboard, color);
        if (!isKingAttacked(newChessboard, kingSquare)) {
          return false;
        }
      }
    }
  }
  return true;
}
