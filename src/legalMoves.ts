import { isKingAttacked } from "./App";
import { Chessboard, Color, ISquare, Position } from "./types";

function isOutOfBounds(y: number, x: number): boolean {
  return y < 0 || y > 7 || x < 0 || x > 7;
}

export function getLegalPawnMoves(
  chessboard: Chessboard,
  pawnSquare: ISquare
): Set<Position> {
  const y = pawnSquare.position.y;
  const x = pawnSquare.position.x;
  const direction = pawnSquare.piece?.color === Color.WHITE ? -1 : 1;
  const legalMoves = new Set<Position>();
  if (y + direction < 0 || y + direction > 7) {
    return legalMoves;
  }

  if (chessboard[y + direction][x].piece === undefined) {
    if (
      y + 2 * direction >= 0 &&
      y + 2 * direction <= 7 &&
      chessboard[y + 2 * direction][x].piece === undefined &&
      !pawnSquare.piece?.hasMoved
    ) {
      legalMoves.add({ y: y + 2 * direction, x });
    }
    legalMoves.add({ y: y + direction, x });
  }
  if (
    x - 1 >= 0 &&
    chessboard[y + direction][x - 1].piece !== undefined &&
    chessboard[y + direction][x - 1].piece?.color !== pawnSquare.piece?.color
  ) {
    legalMoves.add({ y: y + direction, x: x - 1 });
  }
  if (
    x + 1 <= 7 &&
    chessboard[y + direction][x + 1].piece !== undefined &&
    chessboard[y + direction][x + 1].piece?.color !== pawnSquare.piece?.color
  ) {
    legalMoves.add({ y: y + direction, x: x + 1 });
  }
  return legalMoves;
}

export function getLegalKnightMoves(
  chessboard: Chessboard,
  knightSquare: ISquare
): Set<Position> {
  const x = knightSquare.position.x;
  const y = knightSquare.position.y;
  const newPositions = [
    [y - 2, x - 1],
    [y - 2, x + 1],
    [y + 2, x - 1],
    [y + 2, x + 1],
    [y - 1, x - 2],
    [y + 1, x - 2],
    [y - 1, x + 2],
    [y + 1, x + 2],
  ];
  const legalMoves = new Set<Position>();
  for (const [y, x] of newPositions) {
    if (
      !isOutOfBounds(y, x) &&
      chessboard[y][x].piece?.color !== knightSquare.piece?.color
    ) {
      legalMoves.add({ y, x });
    }
  }
  return legalMoves;
}

export function getLegalBishopMoves(
  chessboard: Chessboard,
  bishopSquare: ISquare
): Set<Position> {
  const directions = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  const legalMoves = new Set<Position>();
  for (const [dy, dx] of directions) {
    for (
      let y = bishopSquare.position.y + dy, x = bishopSquare.position.x + dx;
      (dx < 0 ? x >= 0 : x <= 7) && (dy < 0 ? y >= 0 : y <= 7);
      y += dy, x += dx
    ) {
      if (chessboard[y][x].piece === undefined) {
        legalMoves.add({ y, x });
      } else {
        if (chessboard[y][x].piece?.color !== bishopSquare.piece?.color) {
          legalMoves.add({ y, x });
        }
        break;
      }
    }
  }
  return legalMoves;
}

export function getLegalRookMoves(
  chessboard: Chessboard,
  rookSquare: ISquare
): Set<Position> {
  const legalMoves = new Set<Position>();
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];
  for (const [dy, dx] of directions) {
    let y = rookSquare.position.y + dy;
    let x = rookSquare.position.x + dx;
    let predicate = null;
    if (dy == 0) {
      predicate = () => (dx === -1 ? x >= 0 : x <= 7);
    } else {
      predicate = () => (dy === -1 ? y >= 0 : y <= 7);
    }
    for (; predicate(); y += dy, x += dx) {
      if (chessboard[y][x].piece === undefined) {
        legalMoves.add({ y, x });
      } else {
        if (chessboard[y][x].piece?.color !== rookSquare.piece?.color) {
          legalMoves.add({ y, x });
        }
        break;
      }
    }
  }
  return legalMoves;
}

export function getLegalQueenMoves(
  chessboard: Chessboard,
  queenSquare: ISquare
): Set<Position> {
  const legalBishopMoves = getLegalBishopMoves(chessboard, queenSquare);
  const legalRookMoves = getLegalRookMoves(chessboard, queenSquare);
  return new Set([...legalBishopMoves, ...legalRookMoves]);
}

export function getLegalKingMoves(
  chessboard: Chessboard,
  kingSquare: ISquare
): Set<Position> {
  const legalMoves = new Set<Position>();
  const y = kingSquare.position.y;
  const x = kingSquare.position.x;
  for (const dy of [-1, 0, 1]) {
    for (const dx of [-1, 0, 1]) {
      if (
        (dx !== 0 || dy !== 0) &&
        !isOutOfBounds(y + dy, x + dx) &&
        chessboard[y + dy][x + dx].piece?.color !== kingSquare.piece?.color
      ) {
        const newKingSquare = {
          ...kingSquare,
          position: { y: y + dy, x: x + dx },
        };
        const newChessboard = getNewBoard(
          chessboard,
          kingSquare,
          newKingSquare.position
        );
        if (!isKingAttacked(newChessboard, newKingSquare)) {
          legalMoves.add(newKingSquare.position);
        }
      }
    }
  }
  return legalMoves;
}

export function getNewBoard(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position
): Chessboard {
  /* get new board where src has moved to dst */
  return chessboard.map((row, i) => {
    if (i !== dst.y && i !== src.position.y) {
      return row;
    } else {
      return row.map((square, j) => {
        if (i === src.position.y && j === src.position.x)
          return { ...src, piece: undefined };
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
