import { getNewBoard } from "./chessboard";
import {
  getLegalPawnMoves,
  getLegalKnightMoves,
  getLegalBishopMoves,
  getLegalRookMoves,
  getLegalQueenMoves,
  getLegalKingMoves,
  getLegalMoves,
} from "./legalMoves";
import { Chessboard, Color, ISquare, PieceType, Position } from "./types";
import { isValidKingMoveToNotAttacked, isValidMoveUtil } from "./validMoves";

export function getKingSquare(chessboard: Chessboard, color?: Color): ISquare {
  const kingSquare = chessboard
    .flat()
    .find(
      (square) =>
        square.piece?.type === PieceType.KING && square.piece?.color === color,
    );
  if (kingSquare !== undefined) return kingSquare;

  return { piece: undefined, position: { x: -1, y: -1 } };
}

export function isKingAttacked(
  chessboard: Chessboard,
  kingColor?: Color,
): boolean {
  /* Check if 'kingColor' color king is under attack. */
  if (kingColor === undefined) {
    // unreachable
    return false;
  }
  const kingSquare = getKingSquare(chessboard, kingColor);
  return chessboard.flat().some((square) => {
    if (square.piece?.color === kingColor) {
      return false;
    }
    switch (square.piece?.type) {
      case PieceType.PAWN:
        return isValidMoveUtil(
          getLegalPawnMoves,
          chessboard,
          square,
          kingSquare.position,
        );
      case PieceType.KNIGHT:
        return isValidMoveUtil(
          getLegalKnightMoves,
          chessboard,
          square,
          kingSquare.position,
        );
      case PieceType.BISHOP:
        return isValidMoveUtil(
          getLegalBishopMoves,
          chessboard,
          square,
          kingSquare.position,
        );
      case PieceType.ROOK:
        return isValidMoveUtil(
          getLegalRookMoves,
          chessboard,
          square,
          kingSquare.position,
        );
      case PieceType.QUEEN:
        return isValidMoveUtil(
          getLegalQueenMoves,
          chessboard,
          square,
          kingSquare.position,
        );
      case PieceType.KING:
        return isValidKingMoveToNotAttacked(square, kingSquare.position);
    }
  });
}

export function isMated(chessboard: Chessboard, color: Color) {
  /* Check if 'color' player is mated. */
  if (!isKingAttacked(chessboard, color)) {
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
        if (!isKingAttacked(newChessboard, color)) {
          return false;
        }
      }
    }
  }
  return true;
}

export function isDraw(chessboard: Chessboard, color: Color): boolean {
  /* Check if 'color' player is in a draw position. */
  for (const row of chessboard) {
    for (const square of row) {
      if (square.piece?.color !== color) continue;
      const moves = getLegalMoves(chessboard, square);
      if (moves.size > 0) return false;
    }
  }
  return true;
}

export function isCastle(src: ISquare, dst: Position): boolean {
  /* Check if a move is a castle move. */
  const kingY = src.piece?.color === Color.WHITE ? 7 : 0;
  const kingXs = [2, 6];
  return (
    src.piece?.type === PieceType.KING &&
    !src.piece?.hasMoved &&
    dst.y === kingY &&
    kingXs.includes(dst.x)
  );
}

export function makeCastle(
  chessboard: Chessboard,
  kingSquare: ISquare,
  dst: Position,
): Chessboard {
  const y = dst.y;
  const newKingX = dst.x;
  const rookSquare = newKingX === 2 ? chessboard[y][0] : chessboard[y][7];
  const newRookX = newKingX === 2 ? newKingX + 1 : newKingX - 1;
  const newRookPosition = { x: newRookX, y };

  let newChessboard = getNewBoard(chessboard, kingSquare, dst);
  newChessboard = getNewBoard(newChessboard, rookSquare, newRookPosition);
  return newChessboard;
}
