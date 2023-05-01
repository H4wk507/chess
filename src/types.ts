export interface Piece {
  type: string;
  color: string;
  hasMoved: boolean;
}

export interface ISquare {
  piece?: Piece;
  x: number;
  y: number;
}

export type Chessboard = ISquare[][];
