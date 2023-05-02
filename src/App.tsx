import { useState } from "react";
import "./App.css";
import { Chessboard, Color, ISquare, PieceType } from "./types";
import { initChessboard } from "./chessboard";

const initialChessboard = initChessboard();
const moves = [Color.WHITE, Color.BLACK];

function hasFreeRow(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
  let start_x = src.x;
  let end_x = dst.x;
  if (end_x < start_x) [start_x, end_x] = [end_x, start_x];
  for (let col = start_x + 1; col < end_x; col++) {
    if (chessboard[src.y][col].piece) return false;
  }
  return true;
}

function hasFreeColumn(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
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
): boolean {
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
): boolean {
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

function isValidRookMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
  const dx = dst.x - src.x;
  const dy = dst.y - src.y;
  return (
    (dx > 0 && dy === 0 && hasFreeRow(chessboard, src, dst)) || // right
    (dx < 0 && dy === 0 && hasFreeRow(chessboard, src, dst)) || // left
    (dy > 0 && dx === 0 && hasFreeColumn(chessboard, src, dst)) || // down
    (dy < 0 && dx === 0 && hasFreeColumn(chessboard, src, dst)) // up
  );
}

function isValidBishopMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
  const dx = Math.abs(dst.x - src.x);
  const dy = Math.abs(dst.y - src.y);
  return (
    dx === dy &&
    (hasFreeMainDiagonal(chessboard, src, dst) ||
      hasFreeSecondDiagonal(chessboard, src, dst))
  );
}

function isValidKingMove(src: ISquare, dst: ISquare): boolean {
  // TODO: castle
  const dx = Math.abs(dst.x - src.x);
  const dy = Math.abs(dst.y - src.y);
  return dx + dy === 1 || (dx + dy === 2 && dx === dy);
}

function isValidKnightMove(src: ISquare, dst: ISquare): boolean {
  const dx = Math.abs(dst.x - src.x);
  const dy = Math.abs(dst.y - src.y);
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
}

function isValidQueenMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
  return (
    isValidRookMove(chessboard, src, dst) ||
    isValidBishopMove(chessboard, src, dst)
  );
}

function isValidPawnMove(src: ISquare, dst: ISquare): boolean {
  // TODO: en passant
  const dx = dst.x - src.x;
  const dy = dst.y - src.y;
  const direction = src.piece?.color === Color.WHITE ? -1 : 1;

  if (src.piece?.hasMoved) {
    if (dy !== direction) return false;
  } else {
    if (dy !== direction && dy !== 2 * direction) return false;
  }

  if (isValidPawnAttack(src, dst)) return true;
  if (dx === 0) return dst.piece === undefined;
  return false; // unreachable?
}

function isValidPawnAttack(src: ISquare, dst: ISquare): boolean {
  const dx = dst.x - src.x;
  const dy = dst.y - src.y;
  return (
    Math.abs(dx) === 1 &&
    Math.abs(dy) === 1 &&
    dst.piece !== undefined &&
    dst.piece.color !== src.piece?.color
  );
}

function getKingPosition(chessboard: Chessboard, color?: Color): ISquare {
  const kingSquare = chessboard
    .flat()
    .find(
      (square) =>
        square.piece?.type === PieceType.KING && square.piece?.color === color
    );
  if (kingSquare) return kingSquare;

  console.log("unreachable");
  return { piece: undefined, x: -1, y: -1 } as ISquare;
}

function isKingAttacked(chessboard: Chessboard, kingSquare: ISquare): boolean {
  return chessboard.flat().some((square) => {
    if (square.piece?.color === kingSquare.piece?.color) {
      return false;
    }
    switch (square.piece?.type) {
      case PieceType.PAWN:
        return isValidPawnAttack(square, kingSquare);
      case PieceType.ROOK:
        return isValidRookMove(chessboard, square, kingSquare);
      case PieceType.QUEEN:
        return isValidQueenMove(chessboard, square, kingSquare);
      case PieceType.BISHOP:
        return isValidBishopMove(chessboard, square, kingSquare);
      case PieceType.KNIGHT:
        return isValidKnightMove(square, kingSquare);
    }
  });
}

function isValidMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
  const takenBySameColor = dst.piece && dst.piece.color === src.piece?.color;
  if (takenBySameColor) {
    return false;
  }

  switch (src.piece?.type) {
    case PieceType.PAWN:
      if (!isValidPawnMove(src, dst)) return false;
      break;
    case PieceType.ROOK:
      if (!isValidRookMove(chessboard, src, dst)) return false;
      break;
    case PieceType.QUEEN:
      if (!isValidQueenMove(chessboard, src, dst)) return false;
      break;
    case PieceType.BISHOP:
      if (!isValidBishopMove(chessboard, src, dst)) return false;
      break;
    case PieceType.KING:
      if (!isValidKingMove(src, dst)) return false;
      break;
    case PieceType.KNIGHT:
      if (!isValidKnightMove(src, dst)) return false;
      break;
  }
  const newChessboard = getNewBoard(chessboard, src, dst);
  const kingSquare = getKingPosition(newChessboard, src.piece?.color);
  return !isKingAttacked(newChessboard, kingSquare);
}

function getNewBoard(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): Chessboard {
  /* get new board where src has moved to dst */
  return chessboard.map((row, i) => {
    if (i !== dst.y && i !== src.y) {
      return row;
    } else {
      return row.map((square, j) => {
        if (i === src.y && j === src.x) return { ...src, piece: undefined };
        else if (i === dst.y && j === dst.x) {
          return {
            ...square,
            piece: {
              // @ts-ignore
              type: src.piece.type, // @ts-ignore
              color: src.piece.color,
              hasMoved: true,
            },
          };
        } else {
          return square;
        }
      });
    }
  });
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
  setSelectedItem: (item: null | ISquare) => void;
  chessboard: Chessboard;
  setChessboard: (chessboard: Chessboard) => void;
  currentMove: number;
  setCurrentMove: (move: number) => void;
}) {
  const handleClick = () => {
    // TODO: refactor this mess
    let kingSquare = getKingPosition(chessboard, moves[currentMove]);
    if (square.piece && moves[currentMove] === square?.piece?.color) {
      setSelectedItem(square);
    } else if (selectedItem) {
      if (isKingAttacked(chessboard, kingSquare)) {
        const newChessboard = getNewBoard(chessboard, selectedItem, square);
        kingSquare = getKingPosition(newChessboard, moves[currentMove]);
        if (!isKingAttacked(newChessboard, kingSquare)) {
          setChessboard(getNewBoard(newChessboard, selectedItem, square));
          setCurrentMove((currentMove + 1) % 2);
          setSelectedItem(null);
        }
      } else if (isValidMove(chessboard, selectedItem, square)) {
        setChessboard(getNewBoard(chessboard, selectedItem, square));
        setCurrentMove((currentMove + 1) % 2);
        setSelectedItem(null);
      }
    }
  };

  const color = (square.x + square.y) % 2 === 0 ? "white" : "black";
  return (
    <div
      className={`square ${color}`}
      style={{
        color: square?.piece?.color === Color.WHITE ? "white" : "black",
      }}
      onClick={handleClick}
    >
      {typeToString(square?.piece?.type)}
    </div>
  );
}

function typeToString(type?: PieceType): string {
  switch (type) {
    case PieceType.PAWN:
      return "p";
    case PieceType.KNIGHT:
      return "k";
    case PieceType.BISHOP:
      return "b";
    case PieceType.ROOK:
      return "r";
    case PieceType.QUEEN:
      return "q";
    case PieceType.KING:
      return "ki";
    default:
      return "";
  }
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
      <p>Selected: {typeToString(selectedItem?.piece?.type)}</p>
      <p>Turn: {moves[currentMove] ? "black" : "white"}</p>
    </div>
  );
}

export default App;
