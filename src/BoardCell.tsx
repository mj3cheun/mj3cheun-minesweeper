import React, { memo } from 'react';
import { CellStatus } from './store.ts';
import { CELL_DIM, SHOW_MINES_ON } from './Minesweeper.tsx';

import bomb from './bomb.png';

import './BoardCell.css';

interface BoardCellProps {
  status: CellStatus,
  displayMines: boolean,
  minedProx: number,
  coord: [number, number]
}

function getBoardCellStyle(coord, background, showBomb) {
  return {
    backgroundImage: showBomb ? `url("${bomb}")` : '',
    backgroundColor: background,
    gridColumn: `${coord[0] + 1} / span 1`,
    gridRow: `${coord[1] + 1} / span 1`,
    lineHeight: `${CELL_DIM}px`,
  };
}

const BoardCell = (props: BoardCellProps) => {
    const {status, displayMines, minedProx, coord} = props;
    const hasBomb = minedProx === 0;

    if(status === CellStatus.Flagged) {
      return (
        <div className="BoardCell" style={getBoardCellStyle(coord, 'green', displayMines && hasBomb)}></div>
      )
    }

    if(displayMines && hasBomb) {
      return (
        <div className="BoardCell" style={getBoardCellStyle(coord, 'red', true)}></div>
      );
    }

    // debug / cheat coloring
    if(SHOW_MINES_ON && minedProx === 0) {
      return (
        <div className="BoardCell" style={getBoardCellStyle(coord, 'darkred', hasBomb)}>
        </div>
      );
    }

    if(status === CellStatus.Revealed) {
      return (
        <div className="BoardCell" style={getBoardCellStyle(coord, 'grey', hasBomb)}>
          {minedProx !== -1 ? minedProx : ''}
        </div>
      );
    }
}

export default memo(BoardCell, (prevProps, nextProps) => {
  return prevProps.status === nextProps.status
    && prevProps.displayMines === nextProps.displayMines
    && prevProps.minedProx === nextProps.minedProx
    && prevProps.coord[0] === nextProps.coord[0]
    && prevProps.coord[1] === nextProps.coord[1];
});