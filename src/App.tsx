import { useState } from "react";
import "./App.css";
import { Chessboard, Color, ISquare, PieceType, Position } from "./types";
import { initChessboard } from "./chessboard";
import {
  getLegalBishopMoves,
  getLegalKingMoves,
  getLegalKnightMoves,
  getLegalPawnMoves,
  getLegalQueenMoves,
  getLegalRookMoves,
  getNewBoard,
} from "./legalMoves";
import { containsPosition, pieceToSvg } from "./utils";

const initialChessboard = initChessboard();
const moves = [Color.WHITE, Color.BLACK];

function isValidRookMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position
): boolean {
  const legalMoves = getLegalRookMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

function isValidBishopMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position
): boolean {
  const legalMoves = getLegalBishopMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

function isValidKingMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position
): boolean {
  // TODO: mate
  // TODO: castle
  const legalMoves = getLegalKingMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

function isValidKnightMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position
): boolean {
  const legalMoves = getLegalKnightMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.x && move.y === dst.y) return true;
  }
  return false;
}

function isValidQueenMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
  const legalMoves = getLegalQueenMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.position.x && move.y === dst.position.y) return true;
  }
  return false;
}

function isValidPawnMove(
  chessboard: Chessboard,
  src: ISquare,
  dst: ISquare
): boolean {
  // TODO: en passant
  const legalMoves = getLegalPawnMoves(chessboard, src);
  for (const move of legalMoves) {
    if (move.x === dst.position.x && move.y === dst.position.y) return true;
  }
  return false;
}

function getKingPosition(chessboard: Chessboard, color?: Color): ISquare {
  const kingSquare = chessboard
    .flat()
    .find(
      (square) =>
        square.piece?.type === PieceType.KING && square.piece?.color === color
    );
  if (kingSquare) return kingSquare;

  return { piece: undefined, position: { x: -1, y: -1 } };
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
      if (!isValidPawnMove(chessboard, src, dst)) return false;
      break;
    case PieceType.KNIGHT:
      if (!isValidKnightMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.BISHOP:
      if (!isValidBishopMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.ROOK:
      if (!isValidRookMove(chessboard, src, dst.position)) return false;
      break;
    case PieceType.QUEEN:
      if (!isValidQueenMove(chessboard, src, dst)) return false;
      break;
    case PieceType.KING:
      if (!isValidKingMove(chessboard, src, dst.position)) return false;
      break;
  }
  const newChessboard = getNewBoard(chessboard, src, dst.position);
  const kingSquare = getKingPosition(newChessboard, src.piece?.color);
  return !isKingAttacked(newChessboard, kingSquare);
}

export function isKingAttacked(
  chessboard: Chessboard,
  kingSquare: ISquare
): boolean {
  return chessboard.flat().some((square) => {
    if (square.piece?.color === kingSquare.piece?.color) {
      return false;
    }
    switch (square.piece?.type) {
      case PieceType.PAWN:
        return isValidPawnMove(chessboard, square, kingSquare);
      case PieceType.KNIGHT:
        return isValidKnightMove(chessboard, square, kingSquare.position);
      case PieceType.BISHOP:
        return isValidBishopMove(chessboard, square, kingSquare.position);
      case PieceType.ROOK:
        return isValidRookMove(chessboard, square, kingSquare.position);
      case PieceType.QUEEN:
        return isValidQueenMove(chessboard, square, kingSquare);
      // adding king gives infinite recursion reference, find a way around that
    }
  });
}

function isMated(chessboard: Chessboard, color: Color) {
  // check if color is in mate position
  const kingSquare = getKingPosition(chessboard, color);
  if (!isKingAttacked(chessboard, kingSquare)) {
    return false;
  }
  for (const row of chessboard) {
    for (const square of row) {
      if (square.piece?.color !== color) continue;
      let moves = new Set<Position>();
      switch (square.piece.type) {
        case PieceType.PAWN:
          moves = getLegalPawnMoves(chessboard, square);
          break;
        case PieceType.KNIGHT:
          moves = getLegalKnightMoves(chessboard, square);
          break;
        case PieceType.BISHOP:
          moves = getLegalBishopMoves(chessboard, square);
          break;
        case PieceType.ROOK:
          moves = getLegalRookMoves(chessboard, square);
          break;
        case PieceType.QUEEN:
          moves = getLegalQueenMoves(chessboard, square);
          break;
        case PieceType.KING:
          moves = getLegalKingMoves(chessboard, square);
          break;
      }
      for (const move of moves) {
        const newChessboard = getNewBoard(chessboard, square, move);
        const kingSquare = getKingPosition(chessboard, color);
        if (!isKingAttacked(newChessboard, kingSquare)) {
          return false;
        }
      }
    }
  }
  return true;
}

function getLegalMoves(chessboard: Chessboard, square: ISquare): Set<Position> {
  switch (square.piece?.type) {
    case PieceType.PAWN:
      return getLegalPawnMoves(chessboard, square);
    case PieceType.KNIGHT:
      return getLegalKnightMoves(chessboard, square);
    case PieceType.BISHOP:
      return getLegalBishopMoves(chessboard, square);
    case PieceType.ROOK:
      return getLegalRookMoves(chessboard, square);
    case PieceType.QUEEN:
      return getLegalQueenMoves(chessboard, square);
    case PieceType.KING:
      return getLegalKingMoves(chessboard, square);
  }
  return new Set();
}

// TODO: pat
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
