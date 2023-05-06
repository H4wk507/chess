import { useState } from "react";
import "./App.css";
import { Chessboard, Color, ISquare, PieceType, Position } from "./types";
import { getNewBoard, initChessboard } from "./chessboard";
import { containsPosition, pieceToSvg } from "./utils";
import { getKingPosition, isKingAttacked, isMated } from "./kingLogic";
import { getLegalMoves } from "./legalMoves";
import { isValidMove } from "./validMoves";

const initialChessboard = initChessboard();
const moves = [Color.WHITE, Color.BLACK];

// TODO: pat
// TODO: clicking same piece unclicks its
function Square({
  square,
  selectedItem,
  setSelectedItem,
  chessboard,
  setChessboard,
  currentMove,
  setCurrentMove,
  legalMoves,
  setLegalMoves,
  setWinner,
}: {
  square: ISquare;
  selectedItem: null | ISquare;
  setSelectedItem: (item: null | ISquare) => void;
  chessboard: Chessboard;
  setChessboard: (chessboard: Chessboard) => void;
  currentMove: number;
  setCurrentMove: (move: number) => void;
  legalMoves: Set<Position>;
  setLegalMoves: (moves: Set<Position>) => void;
  setWinner: (winner: Color) => void;
}) {
  const handleClick = () => {
    // TODO: refactor this mess
    let kingSquare = getKingPosition(chessboard, moves[currentMove]);
    if (square.piece && moves[currentMove] === square?.piece?.color) {
      setSelectedItem(square);
      setLegalMoves(getLegalMoves(chessboard, square));
    } else if (selectedItem) {
      if (isKingAttacked(chessboard, kingSquare)) {
        if (!isValidMove(chessboard, selectedItem, square)) return;
        const newChessboard = getNewBoard(
          chessboard,
          selectedItem,
          square.position
        );
        kingSquare = getKingPosition(newChessboard, moves[currentMove]);
        if (!isKingAttacked(newChessboard, kingSquare)) {
          setChessboard(
            getNewBoard(newChessboard, selectedItem, square.position)
          );
          setCurrentMove((currentMove + 1) % 2);
          setSelectedItem(null);
          setLegalMoves(new Set());
        }
      } else if (isValidMove(chessboard, selectedItem, square)) {
        const newChessboard = getNewBoard(
          chessboard,
          selectedItem,
          square.position
        );
        const nextMove = (currentMove + 1) % 2;
        if (isMated(newChessboard, moves[nextMove])) {
          setWinner(moves[currentMove]);
        }
        setChessboard(newChessboard);
        setCurrentMove(nextMove);
        setSelectedItem(null);
        setLegalMoves(new Set());
      }
    }
  };

  let color =
    (square.position.x + square.position.y) % 2 === 0 ? "white" : "black";
  if (containsPosition(square.position, legalMoves)) {
    color = "available";
  }
  const imagePath = pieceToSvg(square?.piece);
  return (
    <div className={`square ${color}`} onClick={handleClick}>
      {imagePath && <img src={imagePath} />}
    </div>
  );
}

function App() {
  const [selectedItem, setSelectedItem] = useState<null | ISquare>(null);
  const [chessboard, setChessboard] = useState(initialChessboard);
  const [currentMove, setCurrentMove] = useState(0);
  const [legalMoves, setLegalMoves] = useState<Set<Position>>(new Set());
  const [winner, setWinner] = useState<Color | null>(null);

  return (
    <div className="App">
      <div className="chessboard">
        {chessboard.map((row, i) => {
          return (
            <div key={i} className="row">
              {row.map((square, j) => (
                <Square
                  key={j}
                  square={square}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  chessboard={chessboard}
                  setChessboard={setChessboard}
                  currentMove={currentMove}
                  setCurrentMove={setCurrentMove}
                  legalMoves={legalMoves}
                  setLegalMoves={setLegalMoves}
                  setWinner={setWinner}
                />
              ))}
            </div>
          );
        })}
      </div>
      <p>Turn: {moves[currentMove] === Color.WHITE ? "white" : "black"}</p>
      {winner !== null && (
        <p>{winner === Color.WHITE ? "white won" : "black won"}</p>
      )}
    </div>
  );
}

export default App;
