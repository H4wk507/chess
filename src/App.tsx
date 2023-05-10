import { useState } from "react";
import "./App.css";
import {
  Chessboard,
  Color,
  ISquare,
  Position,
  GameState,
  PieceType,
} from "./types";
import { getNewBoard, initChessboard, initEmptyChessboard } from "./chessboard";
import { containsPosition, pieceToSvg, squareEquals } from "./utils";
import {
  getKingPosition,
  isCastle,
  isDraw,
  isKingAttacked,
  isMated,
  makeCastle,
} from "./kingLogic";
import { getLegalMoves } from "./legalMoves";
import { isValidMove } from "./validMoves";

const initialChessboard = initChessboard();

/*
initialChessboard[3][3] = {
  piece: { type: PieceType.QUEEN, color: Color.BLACK, hasMoved: true },
  position: { y: 3, x: 3 },
};
initialChessboard[7][4] = {
  piece: { type: PieceType.KING, color: Color.WHITE, hasMoved: false },
  position: { y: 7, x: 4 },
};
initialChessboard[0][1] = {
  piece: { type: PieceType.KING, color: Color.BLACK, hasMoved: true },
  position: { y: 0, x: 1 },
};
initialChessboard[7][0] = {
  piece: { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false },
  position: { y: 7, x: 0 },
};
initialChessboard[7][7] = {
  piece: { type: PieceType.ROOK, color: Color.WHITE, hasMoved: false },
  position: { y: 7, x: 7 },
};
*/

const moves = [Color.WHITE, Color.BLACK];

// TODO: promotion
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
  setGameState,
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
  setGameState: (state: GameState) => void;
}) {
  const handleClick = () => {
    // TODO: refactor this mess
    if (selectedItem && squareEquals(selectedItem, square)) {
      setSelectedItem(null);
      setLegalMoves(new Set());
    } else if (square.piece && moves[currentMove] === square?.piece?.color) {
      setSelectedItem(square);
      setLegalMoves(getLegalMoves(chessboard, square));
    } else if (selectedItem) {
      let kingSquare = getKingPosition(chessboard, moves[currentMove]);
      if (isKingAttacked(chessboard, kingSquare)) {
        if (!isValidMove(chessboard, selectedItem, square)) return;
        const newChessboard = getNewBoard(
          chessboard,
          selectedItem,
          square.position,
        );
        kingSquare = getKingPosition(newChessboard, moves[currentMove]);
        if (!isKingAttacked(newChessboard, kingSquare)) {
          setChessboard(
            getNewBoard(newChessboard, selectedItem, square.position),
          );
          setCurrentMove((currentMove + 1) % 2);
          setSelectedItem(null);
          setLegalMoves(new Set());
        }
      } else if (isValidMove(chessboard, selectedItem, square)) {
        let newChessboard = null;
        if (isCastle(selectedItem, square.position)) {
          newChessboard = makeCastle(chessboard, selectedItem, square.position);
        } else {
          newChessboard = getNewBoard(
            chessboard,
            selectedItem,
            square.position,
          );
        }
        const nextMove = (currentMove + 1) % 2;
        if (isMated(newChessboard, moves[nextMove])) {
          setGameState(
            moves[currentMove] === Color.WHITE
              ? GameState.WHITE
              : GameState.BLACK,
          );
        } else if (isDraw(newChessboard, moves[nextMove])) {
          setGameState(GameState.DRAW);
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
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);

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
                  setGameState={setGameState}
                />
              ))}
            </div>
          );
        })}
      </div>
      <p>Turn: {moves[currentMove] === Color.WHITE ? "white" : "black"}</p>
      {gameState !== GameState.PLAYING && (
        <p>
          {gameState === GameState.WHITE
            ? "white won"
            : gameState === GameState.BLACK
            ? "black won"
            : "draw"}
        </p>
      )}
    </div>
  );
}

export default App;
