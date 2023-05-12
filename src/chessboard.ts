/* All functions related to chessboard state */

import { Chessboard, Color, ISquare, PieceType, Position } from "./types";

export function initChessboard(): Chessboard {
  const chessboard: Chessboard = [];
  initFirstRow(chessboard, 0, Color.BLACK);
  initSecondRow(chessboard, 1, Color.BLACK);
  initEmptyRow(chessboard, 2);
  initEmptyRow(chessboard, 3);
  initEmptyRow(chessboard, 4);
  initEmptyRow(chessboard, 5);
  initSecondRow(chessboard, 6, Color.WHITE);
  initFirstRow(chessboard, 7, Color.WHITE);
  return chessboard;
}

export function initEmptyChessboard(): Chessboard {
  const chessboard: Chessboard = [];
  for (let i = 0; i < 8; i++) {
    initEmptyRow(chessboard, i);
  }
  return chessboard;
}

function initFirstRow(chessboard: Chessboard, row: number, color: Color): void {
  chessboard.push([
    {
      piece: { type: PieceType.ROOK, color, hasMoved: false },
      position: { x: 0, y: row },
    },
    {
      piece: { type: PieceType.KNIGHT, color, hasMoved: false },
      position: { x: 1, y: row },
    },
    {
      piece: { type: PieceType.BISHOP, color, hasMoved: false },
      position: { x: 2, y: row },
    },
    {
      piece: { type: PieceType.QUEEN, color, hasMoved: false },
      position: { x: 3, y: row },
    },
    {
      piece: { type: PieceType.KING, color, hasMoved: false },
      position: { x: 4, y: row },
    },
    {
      piece: { type: PieceType.BISHOP, color, hasMoved: false },
      position: { x: 5, y: row },
    },
    {
      piece: { type: PieceType.KNIGHT, color, hasMoved: false },
      position: { x: 6, y: row },
    },
    {
      piece: { type: PieceType.ROOK, color, hasMoved: false },
      position: { x: 7, y: row },
    },
  ]);
}

function initSecondRow(
  chessboard: Chessboard,
  row: number,
  color: Color,
): void {
  chessboard.push(
    Array.from({ length: 8 }, (_, i) => {
      return {
        piece: { type: PieceType.PAWN, color, hasMoved: false },
        position: { x: i, y: row },
      };
    }),
  );
}

export function initEmptyRow(chessboard: Chessboard, row: number): void {
  chessboard.push(
    Array.from({ length: 8 }, (_, i) => {
      return { position: { x: i, y: row } };
    }),
  );
}

export function getNewBoard(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): Chessboard {
  /* Get a new chessboard where src has moved to dst position. */
  if (src === undefined || src.piece === undefined) {
    // unreachable
    return [];
  }
  const newChessboard: Chessboard = structuredClone(chessboard);
  newChessboard[src.position.y][src.position.x].piece = undefined;
  newChessboard[dst.y][dst.x].piece = { ...src.piece, hasMoved: true };
  return newChessboard;
}

export function hasFreeRow(
  chessboard: Chessboard,
  src: Position,
  dst: Position,
): boolean {
  const y = src.y;
  let startX = src.x;
  let endX = dst.x;
  if (startX > endX) [startX, endX] = [endX, startX];
  for (let x = startX + 1; x < endX; x++) {
    if (chessboard[y][x].piece !== undefined) return false;
  }
  return true;
}
