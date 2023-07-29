import { CellStatus } from '../store.ts';
import { coordToIdx, iterateEleWithKernelIdx } from './grid.ts';

function getClickCoord(gameType, e): [number, number] {
  const {height, width} = gameType;
  const rect = e.target.getBoundingClientRect();

  // get relative position within the board
  const x = (e.clientX - rect.left) / rect.width; // x position within the element.
  const y = (e.clientY - rect.top) / rect.height;  // y position within the element.

  // get coord index of the cell
  return [Math.floor(x / (1 / width)), Math.floor(y / (1 / height))];
}

export function getClickIdx(gameType, e): number {
  return coordToIdx(gameType, ...getClickCoord(gameType, e));
}

export function placeMine(gameType, board, randomIdx: number) {
  // place mine
  board[randomIdx] = { status: CellStatus.None, minedProx: 0 };

  // update mine prox values for all neighboring cells
  iterateEleWithKernelIdx(gameType, randomIdx, kernelIdx => {
    const neighborState = board[kernelIdx];
    if(neighborState) {
      board[kernelIdx] = {
        ...board[kernelIdx],
        minedProx: neighborState.minedProx === 0 ? 0 : neighborState.minedProx + 1,
      }
    } else {
      board[kernelIdx] = { status: CellStatus.None, minedProx: 1 };
    }
  });
}

export function revealCell(board, idx) {
  if (board[idx]) {
    // board[idx].status = CellStatus.Revealed;
    board[idx] = {
      ...board[idx],
      status: CellStatus.Revealed,
    }
  } else {
    board[idx] = {
      status: CellStatus.Revealed,
      minedProx: -1,
    };
  }
}

export function fillCell(gameType, board, selectedIdx: number) {
  const floodQueue = [selectedIdx];
  const traversedCells = [selectedIdx];

  while (floodQueue.length) {
    // remove an idx from the end of queue
    const idx = floodQueue.pop() as number;

    // set status of state associated with idx to revealed
    revealCell(board, idx);

    // look at all the direct neighbors
    // reveal all neighbors with no mine prox. and add to search queue
    iterateEleWithKernelIdx(gameType, idx, kernelIdx => {
      const neighborState = board[kernelIdx];
      if (
        !neighborState ||
        (
          neighborState.minedProx === -1 &&
            neighborState.status !== CellStatus.Revealed &&
            neighborState.status !== CellStatus.Flagged
        )
      ) {
        floodQueue.push(kernelIdx);
        traversedCells.push(kernelIdx);
        revealCell(board, kernelIdx);
      }
    });
  }

  // iterate again over all traversed nodes and reveal all cells in neighborhood
  // this could probably be cleaned up
  traversedCells.map(travIdx => iterateEleWithKernelIdx(gameType, travIdx, kernelIdx => {
    const neighborState = board[kernelIdx];
    if(neighborState.status !== CellStatus.Revealed && neighborState.status !== CellStatus.Flagged) {
      revealCell(board, kernelIdx);
      traversedCells.push(kernelIdx);
    }
  }));

  return traversedCells.length;
};