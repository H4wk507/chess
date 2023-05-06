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

export type Position = {
  y: number;
  x: number;
};

export type Piece = {
  type: PieceType;
  color: Color;
  hasMoved: boolean;
};

export type ISquare = {
  piece?: Piece;
  position: Position;
};

export type Chessboard = ISquare[][];
