export enum Color {
  WHITE,
  BLACK,
}

export enum PieceType {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING,
}

export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
}

export interface ISquare {
  piece?: Piece;
  x: number;
  y: number;
}

export type Chessboard = ISquare[][];
