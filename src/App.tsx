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
import {
  colorToString,
  containsPosition,
  pieceToSvg,
  squareEquals,
} from "./utils";
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
import { isPawnPromotion, promotePawn } from "./pawnLogic";

const initialChessboard = initChessboard();

/*
initialChessboard[7][4] = {
  piece: { type: PieceType.KING, color: Color.WHITE, hasMoved: false },
  position: { y: 7, x: 4 },
};
initialChessboard[0][1] = {
  piece: { type: PieceType.KING, color: Color.BLACK, hasMoved: true },
  position: { y: 0, x: 1 },
};
initialChessboard[1][6] = {
  piece: { type: PieceType.PAWN, color: Color.WHITE, hasMoved: false },
  position: { y: 1, x: 6 },
};
initialChessboard[3][3] = {
  piece: { type: PieceType.PAWN, color: Color.BLACK, hasMoved: true },
  position: { y: 3, x: 3 },
};
*/

const moves = [Color.WHITE, Color.BLACK];

/* 
en Passant: Knowledge of the last move taken. Can be accommodated by retaining a lastMove data structure, or retaining the previous board state.
Fifty move rule: requires history of when the last capture or pawn move. Can be accomplished via a lastPawnMoveOrCapture counter
Threefold repetition: requires all previous board states since the last castle, pawn move or capture. A list of hashes of previous states may be an option.
*/
// TODO: host on ipfs
function Square({
  square,
  chessboard,
  setChessboard,
  selectedItem,
  setSelectedItem,
  currentMove,
  setCurrentMove,
  legalMoves,
  setLegalMoves,
  setGameState,
}: {
  square: ISquare;
  chessboard: Chessboard;
  setChessboard: (chessboard: Chessboard) => void;
  selectedItem: null | ISquare;
  setSelectedItem: (item: null | ISquare) => void;
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
      return;
    }

    if (square.piece && moves[currentMove] === square?.piece?.color) {
      setSelectedItem(square);
      setLegalMoves(getLegalMoves(chessboard, square));
      return;
    }

    if (selectedItem) {
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
          if (isPawnPromotion(selectedItem, square.position)) {
            newChessboard = promotePawn(newChessboard, square.position);
          }
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

  const imagePath = pieceToSvg(square?.piece);
  let color = colorToString(moves[(square.position.x + square.position.y) % 2]);
  if (containsPosition(square.position, legalMoves)) {
    color = "available";
  }

  return (
    <div className={`square ${color}`} onClick={handleClick}>
      {imagePath && <img src={imagePath} />}
    </div>
  );
}

function ChessboardComponent({
  currentMove,
  setCurrentMove,
  setGameState,
}: {
  currentMove: Color;
  setCurrentMove: (move: Color) => void;
  setGameState: (state: GameState) => void;
}) {
  const [chessboard, setChessboard] = useState(initialChessboard);
  const [selectedItem, setSelectedItem] = useState<null | ISquare>(null);
  const [legalMoves, setLegalMoves] = useState<Set<Position>>(new Set());

  return (
    <div className="chessboard">
      {chessboard.map((row, i) => {
        return (
          <div key={i} className="row">
            {row.map((square, j) => (
              <Square
                key={j}
                square={square}
                chessboard={chessboard}
                setChessboard={setChessboard}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
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
  );
}

function Turn({ currentMove }: { currentMove: Color }) {
  return <p>Turn: {moves[currentMove] === Color.WHITE ? "white" : "black"}</p>;
}

function GameStateComponent({ gameState }: { gameState: GameState }) {
  return gameState !== GameState.PLAYING ? (
    <p>
      {gameState === GameState.WHITE
        ? "white won"
        : gameState === GameState.BLACK
        ? "black won"
        : "draw"}
    </p>
  ) : null;
}

function App() {
  const [currentMove, setCurrentMove] = useState<Color>(Color.WHITE);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);

  return (
    <div className="App">
      <ChessboardComponent
        currentMove={currentMove}
        setCurrentMove={setCurrentMove}
        setGameState={setGameState}
      />
      <Turn currentMove={currentMove} />
      <GameStateComponent gameState={gameState} />
    </div>
  );
}

export default App;
