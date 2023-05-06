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

export interface Position {
  y: number;
  x: number;
}

export interface Piece {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
}

export interface ISquare {
  piece?: Piece;
  position: Position;
}

export type Chessboard = ISquare[][];
