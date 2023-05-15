export enum Color {
  WHITE = "white",
  BLACK = "black",
}

export enum GameState {
  PLAYING = "Playing",
  WHITE = "White won",
  BLACK = "Black won",
  DRAW = "Draw",
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

// type TakenSquare = Required<ISquare>

export type Move = {
  piece: Piece;
  src: Position;
  dst: Position;
};

export type Chessboard = ISquare[][];
