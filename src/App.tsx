import { useState } from "react";
import "./App.css";

interface Piece {
  type: string;
  color: string;
}

interface ISquare {
  piece?: Piece;
  x: number;
  y: number;
}

type Chessboard = ISquare[][];

function initFirstRow(chessboard: Chessboard, row: number, color: string) {
  chessboard.push([
    { piece: { type: "r", color }, x: 0, y: row },
    { piece: { type: "k", color }, x: 1, y: row },
    { piece: { type: "b", color }, x: 2, y: row },
    { piece: { type: "q", color }, x: 3, y: row },
    { piece: { type: "ki", color }, x: 4, y: row },
    { piece: { type: "b", color }, x: 5, y: row },
    { piece: { type: "k", color }, x: 6, y: row },
    { piece: { type: "r", color }, x: 7, y: row },
  ]);
}

function initSecondRow(chessboard: Chessboard, row: number, color: string) {
  chessboard.push(
    Array.from({ length: 8 }, (_, i) => {
      return { piece: { type: "p", color }, x: i, y: row };
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

function initChessboard() {
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
const initialChessboard = initChessboard();
const moves = ["white", "black"];

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
      (!square.piece || square.piece.color !== selectedItem?.piece?.color)
    ) {
      setChessboard(
        chessboard.map((row, i) => {
          if (i !== square.y) {
            return row;
          } else {
            return row.map((s, j) => {
              if (j !== square?.x) {
                return s;
              } else {
                return { ...s, piece: selectedItem?.piece };
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
