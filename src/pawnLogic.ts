import { getNewBoard } from "./chessboard";
import { ISquare, Position, Color, PieceType, Chessboard } from "./types";

export function isPawnPromotion(src: ISquare, dst: Position): boolean {
  /* Check if a move from src to dst is a pawn promotion. */
  const promotionY = src.piece?.color === Color.WHITE ? 0 : 7;
  return src.piece?.type === PieceType.PAWN && dst.y === promotionY;
}

export function promotePawn(
  chessboard: Chessboard,
  pawnSquare: ISquare,
): Chessboard {
  /* Promote pawn into a queen. */
  const newChessboard: Chessboard = structuredClone(chessboard);
  const y = pawnSquare.position.y;
  const x = pawnSquare.position.x;
  newChessboard[y][x].piece = { ...pawnSquare.piece!, type: PieceType.QUEEN };
  return newChessboard;
}

export function isEnPassant(src: ISquare, dst: ISquare): boolean {
  return (
    src.piece?.type === PieceType.PAWN &&
    Math.abs(src.position.y - dst.position.y) === 1 &&
    Math.abs(src.position.x - dst.position.x) === 1 &&
    dst.piece === undefined
  );
}

export function makeEnPassant(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): Chessboard {
  const newChessboard = getNewBoard(chessboard, src, dst);
  const direction = src.piece?.color === Color.WHITE ? 1 : -1;
  newChessboard[dst.y + direction][dst.x].piece = undefined;
  return newChessboard;
}
