import { ISquare, Position, Color, PieceType, Chessboard } from "./types";

export function isPawnPromotion(src: ISquare, dst: Position): boolean {
  /* Check if a move from src to dst is a pawn promotion. */
  const promotionY = src.piece?.color === Color.WHITE ? 0 : 7;
  return src.piece?.type === PieceType.PAWN && dst.y === promotionY;
}

export function promotePawn(
  chessboard: Chessboard,
  pawnPosition: Position,
): Chessboard {
  /* Promote pawn into a queen. */
  const newChessboard = structuredClone(chessboard);
  const y = pawnPosition.y;
  const x = pawnPosition.x;
  newChessboard[y][x].piece.type = PieceType.QUEEN;
  return newChessboard;
}
