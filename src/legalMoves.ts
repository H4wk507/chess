import { getNewBoard, hasFreeRow } from "./chessboard";
import { isKingAttacked } from "./kingLogic";
import { Chessboard, Color, ISquare, PieceType, Position } from "./types";

function isOutOfBounds(y: number, x: number): boolean {
  return y < 0 || y > 7 || x < 0 || x > 7;
}

export function getLegalPawnMoves(
  chessboard: Chessboard,
  pawnSquare: ISquare,
): Set<Position> {
  const y = pawnSquare.position.y;
  const x = pawnSquare.position.x;
  const direction = pawnSquare.piece?.color === Color.WHITE ? -1 : 1;
  const legalMoves = new Set<Position>();
  if (y + direction < 0 || y + direction > 7) {
    return legalMoves;
  }

  if (chessboard[y + direction][x].piece === undefined) {
    legalMoves.add({ y: y + direction, x });
    if (
      y + 2 * direction >= 0 &&
      y + 2 * direction <= 7 &&
      chessboard[y + 2 * direction][x].piece === undefined &&
      !pawnSquare.piece?.hasMoved
    ) {
      legalMoves.add({ y: y + 2 * direction, x });
    }
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
  knightSquare: ISquare,
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
  bishopSquare: ISquare,
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
  rookSquare: ISquare,
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
  queenSquare: ISquare,
): Set<Position> {
  const legalBishopMoves = getLegalBishopMoves(chessboard, queenSquare);
  const legalRookMoves = getLegalRookMoves(chessboard, queenSquare);
  return new Set([...legalBishopMoves, ...legalRookMoves]);
}

export function getLegalKingMoves(
  chessboard: Chessboard,
  kingSquare: ISquare,
): Set<Position> {
  const legalMoves = new Set<Position>();
  const y = kingSquare.position.y;
  const x = kingSquare.position.x;
  const color = kingSquare.piece?.color;
  for (const dy of [-1, 0, 1]) {
    for (const dx of [-1, 0, 1]) {
      if (
        (dx !== 0 || dy !== 0) &&
        !isOutOfBounds(y + dy, x + dx) &&
        chessboard[y + dy][x + dx].piece?.color !== color
      ) {
        const newPosition = { y: y + dy, x: x + dx };
        const newChessboard = getNewBoard(chessboard, kingSquare, newPosition);
        if (!isKingAttacked(newChessboard, color)) {
          legalMoves.add(newPosition);
        }
      }
    }
  }
  if (isKingAttacked(chessboard, color)) {
    return legalMoves;
  }
  const castleMoves = getLegalCastleMoves(chessboard, kingSquare);
  const notAttackedCastleMoves = getNotAttackedCastleMoves(
    chessboard,
    castleMoves,
    kingSquare,
  );
  for (const move of notAttackedCastleMoves) {
    legalMoves.add(move);
  }
  return legalMoves;
}

function getLegalCastleMoves(
  chessboard: Chessboard,
  kingSquare: ISquare,
): Set<Position> {
  const rookY = kingSquare.piece?.color === Color.WHITE ? 7 : 0;
  const castleMoves = new Set<Position>();
  for (const rookX of [0, 7]) {
    const rookPosition = { y: rookY, x: rookX };
    if (
      !kingSquare.piece?.hasMoved &&
      chessboard[rookY][rookX].piece?.type === PieceType.ROOK &&
      !chessboard[rookY][rookX].piece?.hasMoved &&
      hasFreeRow(chessboard, kingSquare.position, rookPosition)
    ) {
      const kingX = rookX === 0 ? rookX + 2 : rookX - 1;
      castleMoves.add({ y: rookY, x: kingX });
    }
  }
  return castleMoves;
}

function getNotAttackedCastleMoves(
  chessboard: Chessboard,
  castleMoves: Set<Position>,
  kingSquare: ISquare,
): Set<Position> {
  /* Filter out castle moves that are under attack. */
  const notAttackedCastleMoves = new Set<Position>();
  for (const newKingPosition of castleMoves) {
    if (!attackedRow(chessboard, kingSquare, newKingPosition)) {
      notAttackedCastleMoves.add(newKingPosition);
    }
  }
  return notAttackedCastleMoves;
}

function attackedRow(
  chessboard: Chessboard,
  src: ISquare,
  dst: Position,
): boolean {
  const startX = src.position.x;
  const endX = dst.x;
  const y = src.position.y;
  const dx = startX < endX ? 1 : -1;
  for (let x = startX + dx; startX < endX ? x <= endX : x >= endX; x += dx) {
    const newPosition = { x, y };
    const newChessboard = getNewBoard(chessboard, src, newPosition);
    if (isKingAttacked(newChessboard, src.piece?.color)) {
      return true;
    }
  }
  return false;
}

export function getLegalMoves(
  chessboard: Chessboard,
  square: ISquare,
): Set<Position> {
  let moves = new Set<Position>();
  switch (square.piece?.type) {
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
  const legalMoves = new Set<Position>();
  for (const move of moves) {
    const newChessboard = getNewBoard(chessboard, square, move);
    if (!isKingAttacked(newChessboard, square.piece?.color)) {
      legalMoves.add(move);
    }
  }
  return legalMoves;
}
