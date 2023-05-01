import { Chessboard } from "./types";

export function initChessboard() {
  const chessboard: Chessboard = [];
  initFirstRow(chessboard, 0, "black");
  initSecondRow(chessboard, 1, "black");
  initEmptyRow(chessboard, 2);
  initEmptyRow(chessboard, 3);
  initEmptyRow(chessboard, 4);
  initEmptyRow(chessboard, 5);
  initSecondRow(chessboard, 6, "white");
  initFirstRow(chessboard, 7, "white");
  return chessboard;
}

function initFirstRow(chessboard: Chessboard, row: number, color: string) {
  chessboard.push([
    { piece: { type: "r", color, hasMoved: false }, x: 0, y: row },
    { piece: { type: "k", color, hasMoved: false }, x: 1, y: row },
    { piece: { type: "b", color, hasMoved: false }, x: 2, y: row },
    { piece: { type: "q", color, hasMoved: false }, x: 3, y: row },
    { piece: { type: "ki", color, hasMoved: false }, x: 4, y: row },
    { piece: { type: "b", color, hasMoved: false }, x: 5, y: row },
    { piece: { type: "k", color, hasMoved: false }, x: 6, y: row },
    { piece: { type: "r", color, hasMoved: false }, x: 7, y: row },
  ]);
}

function initSecondRow(chessboard: Chessboard, row: number, color: string) {
  chessboard.push(
    Array.from({ length: 8 }, (_, i) => {
      return { piece: { type: "p", color, hasMoved: false }, x: i, y: row };
    })
  );
}

function initEmptyRow(chessboard: Chessboard, row: number) {
  chessboard.push(
    Array.from({ length: 8 }, (_, i) => {
      return { x: i, y: row };
    })
  );
}
