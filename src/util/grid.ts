const NEIGHBORHOOD_KERNEL = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ];
  
export function coordToIdx(gameType, col, row): number {
  return gameType.width * row + col;
}

export function idxToCoord(gameType, idx) {
  return [idx % gameType.width, Math.floor(idx / gameType.width)];
}

function isCoordValid(gameType, col, row) {
  return (row < gameType.height) && (row >= 0) && (col < gameType.width) && (col >= 0);
}

export function iterateEleWithKernelIdx(gameType, idx, cb, kernel = NEIGHBORHOOD_KERNEL) {
  const [col, row] = idxToCoord(gameType, idx);

  for(let i = 0; i < kernel.length; i++) {
    const coordCol = col + kernel[i][0];
    const coordRow = row + kernel[i][1];

    if (isCoordValid(gameType, coordCol, coordRow)) {
      cb(coordToIdx(gameType, coordCol, coordRow));
    }
  }
}