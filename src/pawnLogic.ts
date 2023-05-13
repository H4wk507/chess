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
  if (pawnSquare.piece === undefined) {
    // unreachable
    return [];
  }
  const newChessboard: Chessboard = structuredClone(chessboard);
  const y = pawnSquare.position.y;
  const x = pawnSquare.position.x;
  newChessboard[y][x].piece = { ...pawnSquare.piece, type: PieceType.QUEEN };
  return newChessboard;
}
