import { useState } from "react";
import "./App.css";
import { Chessboard, ISquare } from "./types";
import { initChessboard } from "./chessboard";

const initialChessboard = initChessboard();
const moves = ["white", "black"];

function hasFreeRow(chessboard: Chessboard, src: ISquare, dst: ISquare) {
  let start_x = src.x;
  let end_x = dst.x;
  if (end_x < start_x) [start_x, end_x] = [end_x, start_x];
  for (let col = start_x + 1; col < end_x; col++) {
    if (chessboard[src.y][col].piece) return false;
  }
  return true;
}

function hasFreeColumn(chessboard: Chessboard, src: ISquare, dst: ISquare) {
  let start_y = src.y;
  let end_y = dst.y;
  if (end_y < start_y) [start_y, end_y] = [end_y, start_y];
  for (let row = start_y + 1; row < end_y; row++) {
    if (chessboard[row][src.x].piece) return false;
  }
  return true;
}

function hasFreeMainDiagonal(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
) {
  let x_start = src.x;
  let y_start = src.y;
  let x_end = dst.x;
  let y_end = dst.y;

  let x_inc = x_start + 1,
    y_inc = y_start - 1;
  for (; x_inc < x_end && y_inc > y_end; x_inc++, y_inc--) {
    if (chessboard[y_inc][x_inc].piece) {
      return false;
    }
  }
  if (x_inc === dst.x && y_inc === dst.y) return true;
  (x_inc = x_start - 1), (y_inc = y_start + 1);
  for (; x_inc > x_end && y_inc < y_end; x_inc--, y_inc++) {
    if (chessboard[y_inc][x_inc].piece) {
      return false;
    }
  }
  return x_inc === dst.x && y_inc === dst.y;
}

function hasFreeSecondDiagonal(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
) {
  let x_start = src.x;
  let y_start = src.y;
  let x_end = dst.x;
  let y_end = dst.y;

  let x_inc = x_start - 1,
    y_inc = y_start - 1;
  for (; x_inc > x_end && y_inc > y_end; x_inc--, y_inc--) {
    if (chessboard[y_inc][x_inc].piece) {
      return false;
    }
  }
  if (x_inc === dst.x && y_inc === dst.y) return true;
  (x_inc = x_start + 1), (y_inc = y_start + 1);
  for (; x_inc < x_end && y_inc < y_end; x_inc++, y_inc++) {
    if (chessboard[y_inc][x_inc].piece) {
      return false;
    }
  }
  return x_inc === dst.x && y_inc === dst.y;
}

function isValidRookMove(chessboard: Chessboard, src: ISquare, dst: ISquare) {
  const dx = dst.x - src.x;
  const dy = dst.y - src.y;
  return (
    (dx > 0 && dy === 0 && hasFreeRow(chessboard, src, dst)) || // right
    (dx < 0 && dy === 0 && hasFreeRow(chessboard, src, dst)) || // left
    (dy > 0 && dx === 0 && hasFreeColumn(chessboard, src, dst)) || // down
    (dy < 0 && dx === 0 && hasFreeColumn(chessboard, src, dst)) // up
  );
}

function isValidBishopMove(chessboard: Chessboard, src: ISquare, dst: ISquare) {
  const dx = Math.abs(dst.x - src.x);
  const dy = Math.abs(dst.y - src.y);
  return (
    dx === dy &&
    (hasFreeMainDiagonal(chessboard, src, dst) ||
      hasFreeSecondDiagonal(chessboard, src, dst))
  );
}

function isValidKingMove(src: ISquare, dst: ISquare) {
  // TODO: check if field we are moving to is under attack
  // TODO: castle
  const dx = Math.abs(dst.x - src.x);
  const dy = Math.abs(dst.y - src.y);
  return dx + dy === 1 || (dx + dy === 2 && dx === dy);
}

function isValidKnightMove(src: ISquare, dst: ISquare) {
  const dx = Math.abs(dst.x - src.x);
  const dy = Math.abs(dst.y - src.y);
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
}

function isValidQueenMove(chessboard: Chessboard, src: ISquare, dst: ISquare) {
  return (
    isValidRookMove(chessboard, src, dst) ||
    isValidBishopMove(chessboard, src, dst)
  );
}

function isValidPawnMove(src: ISquare, dst: ISquare) {
  // TODO: give a Piece object a hasMoved key and allow for 2 square move
  // TODO: en passant
  const dx = dst.x - src.x;
  const dy = dst.y - src.y;
  const direction = src.piece?.color === "white" ? -1 : 1;

  if (dy !== direction) return false;
  if (Math.abs(dx) === 1 && dst.piece && dst.piece.color !== src.piece?.color)
    return true;
  if (dx === 0) return dst.piece === undefined;
}

function isValidMove(chessboard: Chessboard, src: ISquare, dst: ISquare) {
  // TODO: check if king is under attack
  const takenBySameColor = dst.piece && dst.piece.color === src.piece?.color;
  if (takenBySameColor) {
    return false;
  }

  switch (src.piece?.type) {
    case "p":
      return isValidPawnMove(src, dst);
    case "r":
      return isValidRookMove(chessboard, src, dst);
    case "q":
      return isValidQueenMove(chessboard, src, dst);
    case "b":
      return isValidBishopMove(chessboard, src, dst);
    case "ki":
      return isValidKingMove(src, dst);
    case "k":
      return isValidKnightMove(src, dst);
  }
}

function Square({
  square,
  selectedItem,
  setSelectedItem,
  chessboard,
  setChessboard,
  currentMove,
  setCurrentMove,
}: {
  square: ISquare;
  selectedItem: null | ISquare;
  setSelectedItem: (p: null | ISquare) => void;
  chessboard: ISquare[][];
  setChessboard: (chessboard: ISquare[][]) => void;
  currentMove: any;
  setCurrentMove: any;
}) {
  const handleClick = () => {
    if (
      selectedItem === null &&
      square.piece &&
      moves[currentMove] === square?.piece?.color
    ) {
      setSelectedItem(square);
    } else if (
      selectedItem &&
      square.piece &&
      moves[currentMove] === square?.piece?.color
    ) {
      setSelectedItem(square);
    } else if (selectedItem && isValidMove(chessboard, selectedItem, square)) {
      setChessboard(
        chessboard.map((row, i) => {
          if (i !== square.y && i !== selectedItem.y) {
            return row;
          } else {
            return row.map((s, j) => {
              if (i === selectedItem.y && j === selectedItem.x)
                return { ...selectedItem, piece: undefined };
              else if (i === square.y && j === square.x) {
                return { ...s, piece: selectedItem?.piece };
              } else {
                return s;
              }
            });
          }
        })
      );
      setCurrentMove((currentMove + 1) % 2);
      setSelectedItem(null);
    }
  };

  const color = (square.x + square.y) % 2 === 0 ? "white" : "black";
  return (
    <div
      className={`square ${color}`}
      style={{ color: square?.piece?.color }}
      onClick={handleClick}
    >
      {square?.piece?.type}
    </div>
  );
}

function App() {
  const [selectedItem, setSelectedItem] = useState<null | ISquare>(null);
  const [chessboard, setChessboard] = useState(initialChessboard);
  const [currentMove, setCurrentMove] = useState(0);

  return (
    <div className="App">
      <div className="chessboard">
        {chessboard.map((row) => {
          return (
            <div className="row">
              {row.map((square) => (
                <Square
                  square={square}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  chessboard={chessboard}
                  setChessboard={setChessboard}
                  currentMove={currentMove}
                  setCurrentMove={setCurrentMove}
                />
              ))}
            </div>
          );
        })}
      </div>
      <p>Selected: {selectedItem?.piece?.type}</p>
      <p>Turn: {moves[currentMove]}</p>
    </div>
  );
}

export default App;
