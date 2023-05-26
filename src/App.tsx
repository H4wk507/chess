import { useState } from "react";
import "./App.css";
import { Chessboard, Color, ISquare, Position, GameState, Move } from "./types";
import {
  getNewBoard,
  initChessboard,
  isMovePawnMoveOrCapture,
} from "./chessboard";
import {
  colorToString,
  containsPosition,
  pieceToSvg,
  squareEquals,
} from "./utils";
import {
  isCastle,
  isDraw,
  isKingAttacked,
  isMated,
  makeCastle,
} from "./kingLogic";
import { getLegalMoves } from "./legalMoves";
import { isValidMove } from "./validMoves";
import {
  isEnPassant,
  isPawnPromotion,
  makeEnPassant,
  promotePawn,
} from "./pawnLogic";

const initialChessboard = initChessboard();

const moves = [Color.WHITE, Color.BLACK];

/* 
Threefold repetition: Draw if the same position occurs three times during the game. 
Requires all previous board states since the last castle, pawn move or capture. 
*/

// TODO: host on ipfs
// TODO: propose draw button, resign button
// TODO: implement a testing mechanism
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
  gameState,
  setGameState,
  lastMove,
  setLastMove,
  lastPawnMoveOrCapture,
  setLastPawnMoveOrCapture,
}: {
  square: ISquare;
  chessboard: Chessboard;
  setChessboard: (chessboard: Chessboard) => void;
  selectedItem: null | ISquare;
  setSelectedItem: (item: null | ISquare) => void;
  currentMove: Color;
  setCurrentMove: (move: Color) => void;
  legalMoves: Set<Position>;
  setLegalMoves: (moves: Set<Position>) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  lastMove: Move | null;
  setLastMove: (move: Move | null) => void;
  lastPawnMoveOrCapture: number;
  setLastPawnMoveOrCapture: (n: number) => void;
}) {
  const handleClick = (): void => {
    if (gameState !== GameState.PLAYING) {
      return;
    }

    if (selectedItem && squareEquals(selectedItem, square)) {
      setSelectedItem(null);
      setLegalMoves(new Set());
      return;
    }

    if (square.piece && currentMove === square?.piece?.color) {
      setSelectedItem(square);
      setLegalMoves(getLegalMoves(chessboard, square, lastMove));
      return;
    }

    if (
      selectedItem &&
      !isValidMove(chessboard, selectedItem, square, lastMove)
    ) {
      return;
    }

    const nextMove = currentMove === Color.WHITE ? Color.BLACK : Color.WHITE;
    let newChessboard: Chessboard | null = null;
    let newLastMove: Move | null = lastMove
      ? {
          piece: { ...lastMove.piece },
          src: { ...lastMove.src },
          dst: { ...lastMove.dst },
        }
      : null;
    if (selectedItem && selectedItem.piece) {
      if (isKingAttacked(chessboard, currentMove)) {
        newChessboard = getNewBoard(chessboard, selectedItem, square.position);
        if (!isKingAttacked(newChessboard, currentMove)) {
          newChessboard = getNewBoard(
            newChessboard,
            selectedItem,
            square.position,
          );
          newLastMove = {
            piece: { ...selectedItem.piece, hasMoved: true },
            src: { ...selectedItem.position },
            dst: { ...square.position },
          };
          if (isMovePawnMoveOrCapture(selectedItem, square)) {
            setLastPawnMoveOrCapture(0);
          } else {
            lastPawnMoveOrCapture + 1 === 50
              ? setGameState(GameState.DRAW)
              : setLastPawnMoveOrCapture(lastPawnMoveOrCapture + 1);
          }
        }
      } else {
        if (isCastle(selectedItem, square.position)) {
          newChessboard = makeCastle(chessboard, selectedItem, square.position);
          lastPawnMoveOrCapture + 1 === 50
            ? setGameState(GameState.DRAW)
            : setLastPawnMoveOrCapture(lastPawnMoveOrCapture + 1);
        } else if (isEnPassant(selectedItem, square)) {
          newChessboard = makeEnPassant(
            chessboard,
            selectedItem,
            square.position,
          );
          setLastPawnMoveOrCapture(0);
        } else {
          newChessboard = getNewBoard(
            chessboard,
            selectedItem,
            square.position,
          );
          if (isMovePawnMoveOrCapture(selectedItem, square)) {
            setLastPawnMoveOrCapture(0);
          } else {
            lastPawnMoveOrCapture + 1 === 50
              ? setGameState(GameState.DRAW)
              : setLastPawnMoveOrCapture(lastPawnMoveOrCapture + 1);
          }
        }
        newLastMove = {
          piece: { ...selectedItem.piece, hasMoved: true },
          src: { ...selectedItem.position },
          dst: { ...square.position },
        };
        if (isPawnPromotion(selectedItem, square.position)) {
          newChessboard = promotePawn(newChessboard, square);
        }
      }
      if (isMated(newChessboard, nextMove)) {
        setGameState(
          currentMove === Color.WHITE ? GameState.WHITE : GameState.BLACK,
        );
      } else if (isDraw(newChessboard, nextMove)) {
        setGameState(GameState.DRAW);
      }
      setChessboard(newChessboard);
      setCurrentMove(nextMove);
      setSelectedItem(null);
      setLegalMoves(new Set());
      setLastMove(newLastMove);
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
  gameState,
  setGameState,
}: {
  currentMove: Color;
  setCurrentMove: (move: Color) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
}) {
  const [chessboard, setChessboard] = useState(initialChessboard);
  const [selectedItem, setSelectedItem] = useState<null | ISquare>(null);
  const [legalMoves, setLegalMoves] = useState<Set<Position>>(new Set());
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [lastPawnMoveOrCapture, setLastPawnMoveOrCapture] = useState(0);

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
                gameState={gameState}
                setGameState={setGameState}
                lastMove={lastMove}
                setLastMove={setLastMove}
                lastPawnMoveOrCapture={lastPawnMoveOrCapture}
                setLastPawnMoveOrCapture={setLastPawnMoveOrCapture}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Turn({ currentMove }: { currentMove: Color }) {
  return <p>Turn: {currentMove}</p>;
}

function GameStateComponent({ gameState }: { gameState: GameState }) {
  return <>{gameState !== "Playing" && <p>{gameState}</p>}</>;
}

function App() {
  const [currentMove, setCurrentMove] = useState<Color>(Color.WHITE);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);

  return (
    <div className="App">
      <ChessboardComponent
        currentMove={currentMove}
        setCurrentMove={setCurrentMove}
        gameState={gameState}
        setGameState={setGameState}
      />
      <Turn currentMove={currentMove} />
      <GameStateComponent gameState={gameState} />
    </div>
  );
}

export default App;
