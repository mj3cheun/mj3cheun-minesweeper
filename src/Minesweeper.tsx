import React, { useEffect, useMemo, useCallback } from 'react';
import { GameReducerTypes, gameReducer, initializeStore, CellStatus } from './store.ts';

import { idxToCoord, iterateEleWithKernelIdx } from './util/grid.ts';
import { getClickIdx, placeMine, fillCell } from './util/boardInteractions.ts';

import './Minesweeper.css';

import BoardBg from './BoardBg.tsx';
import BoardCell from './BoardCell.tsx';
import GameSettings from './GameSettings.tsx';

export const CELL_DIM = 30;
export const SHOW_MINES_ON = false;

const shallowCloneObject = object => Object.assign({}, object);

export default function Minesweeper() {
  const [store, dispatch] = React.useReducer(
    gameReducer,
    null,
    initializeStore
  );

  const gameTypeSelected = useMemo(() =>
    store.gameType[store.gameTypeSelectedId]
  , [store.gameType, store.gameTypeSelectedId]);

  useEffect(() => {
    const interval = setTimeout(() => {
      if(store.gameState.isStarted && !store.gameState.isFailed && !store.gameState.isComplete) {
        dispatch({type: GameReducerTypes.SetTime, time: store.time + 1});
      }
    }, 1000);
    return () => {
      clearTimeout(interval)
    };
  }, [store.gameState.isStarted, store.gameState.isFailed, store.gameState.isComplete, store.time]);

  const startGame = useCallback((e, board) => {
    const squareIdx = getClickIdx(gameTypeSelected, e);
    dispatch({
      type: GameReducerTypes.SetIsStarted,
      started: true,
    });

    const {height, width, mines} = gameTypeSelected;

    // efficient sparse minefield implementation
    // for(let minesPlaced = 0; minesPlaced < mines;) {
    //   const randomIdx = Math.min(Math.floor(Math.random() * height * width), height * width - 1);
    //   if(randomIdx !== squareIdx && !store.gameState.board[randomIdx]) {
    //     placeMine(randomIdx);
    //     minesPlaced++;
    //   }
    // }

    // inside-out shuffle algorithm
    const cellList: number[] = [];
    for(let i = 0; i < height * width; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      if(j !== i) {
        cellList[i] = cellList[j];
      }
      cellList[j] = i;
    }
    const noBombMap = { [squareIdx]: true };
    iterateEleWithKernelIdx(gameTypeSelected, squareIdx, (kernelIdx) => {
      noBombMap[kernelIdx] = true;
    });
    for(let minesPlaced = 0, i = 0; minesPlaced < mines; i++) {
      const randomIdx = cellList[i];
      if(!noBombMap[randomIdx]) {
        placeMine(gameTypeSelected, board, randomIdx);
        minesPlaced++;
      }
    }

    // dispatch not necessary since selectCell will be called afterwards to update board
  }, [gameTypeSelected])

  const selectCell = useCallback((e, board) => {
    const selectedIdx = getClickIdx(gameTypeSelected, e);
    const state = board[selectedIdx];
    // prevent select interaction with flagged cells
    if(state?.status === CellStatus.Flagged) {
      return;
    }
    if(!state || state.minedProx === -1) {
      console.log('flood');
      // use simple flood fill algo
      const numReveals = fillCell(gameTypeSelected, board, selectedIdx);
      dispatch({
        type: GameReducerTypes.SetBoard,
        board,
        numReveals: store.gameState.numReveals + numReveals,
      });
    } else if(state.minedProx === 0) {
      console.log('boom');
      // end game and reveal all mines
      dispatch({
        type: GameReducerTypes.SetIsFailed,
        failed: true,
      });
    } else if(state.status !== CellStatus.Revealed) {
      console.log('reveal');
      board[selectedIdx] = {
        ...board[selectedIdx],
        status: CellStatus.Revealed,
      };
      dispatch({
        type: GameReducerTypes.SetBoard,
        board,
        numReveals: store.gameState.numReveals + 1,
      });
    }
  }, [gameTypeSelected, store.gameState.numReveals]);

  const flagCell = useCallback((e, board = shallowCloneObject(store.gameState.board)) => {
    console.log('flag');
    e.preventDefault();
    const flaggedIdx = getClickIdx(gameTypeSelected, e);
    const state = board[flaggedIdx];
    if(!state) {
      board[flaggedIdx] = {
        status: CellStatus.Flagged,
        minedProx: -1,
      };
      dispatch({
        type: GameReducerTypes.SetFlags,
        numFlags: store.gameState.numFlags + 1,
      });
    }
    else if(state.status !== CellStatus.Revealed) {
      // allow flag to be toggled
      const willToggleOff = state.status === CellStatus.Flagged;
      board[flaggedIdx] = {
        ...state,
        status: willToggleOff ? CellStatus.None : CellStatus.Flagged,
      }
      dispatch({
        type: GameReducerTypes.SetFlags,
        numFlags: store.gameState.numFlags + (willToggleOff ? -1 : 1),
      });
    }
    dispatch({
      type: GameReducerTypes.SetBoard,
      board,
      numReveals: store.gameState.numReveals,
    });
  }, [gameTypeSelected, store.gameState]);

  const handleBoardClick = useCallback((e) => {
    if(!store.gameState.isComplete && !store.gameState.isFailed) {
      // clone board to satisfy immutability
      const draftBoard = shallowCloneObject(store.gameState.board);
      if(!store.gameState.isStarted) {
        startGame(e, draftBoard);
        selectCell(e, draftBoard);
        return;
      }

      if(e.ctrlKey) {
        flagCell(e, draftBoard);
        return;
      }

      selectCell(e, draftBoard);
    }
  }, [store.gameState, startGame, selectCell, flagCell]);

  const getBoardContainerStyle = React.useMemo(() => ({
    width: `${gameTypeSelected.width * CELL_DIM}px`,
    height: `${gameTypeSelected.height * CELL_DIM}px`
  }), [gameTypeSelected]);

  const getBoardStyle = React.useMemo(() => {
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${gameTypeSelected.width}, ${1 / gameTypeSelected.width * 100}%)`,
      gridTemplateRows: `repeat(${gameTypeSelected.height}, ${1 / gameTypeSelected.height * 100}%)`,
      pointerEvents: 'none' as 'none',
    };
  }, [gameTypeSelected]);

  const getBoardCells = useMemo(() => store.gameState.boardIdx.map(idx => {
    return (<BoardCell
      key={idx}
      coord={idxToCoord(gameTypeSelected, idx)}
      displayMines={store.gameState.isFailed}
      {...store.gameState.board[idx]}
    />);
  }), [gameTypeSelected, store.gameState]);

  const getFooter = useMemo(() => {
    if(store.gameState.isComplete) {
      return 'Winner';
    }
    if(store.gameState.isFailed) {
      return 'Boom';
    }
    return null;
  }, [store.gameState.isComplete, store.gameState.isFailed]);

  return (
    <div className="minesweeper">
      <GameSettings gameTypeSelectedId={store.gameTypeSelectedId} gameType={store.gameType} dispatch={dispatch}/>
      <div className="header">
        <div className="remainingBombs">
          {store.gameType[store.gameTypeSelectedId].mines - store.gameState.numFlags}
        </div>
        <div className="reset">
          <button onClick={() => dispatch({type: GameReducerTypes.ResetBoard})}>Reset</button>
        </div>
        <div className="time">
          {store.time}
        </div>
      </div>
      <div className="boardContainer" onClick={handleBoardClick} onContextMenu={flagCell} style={getBoardContainerStyle}>
        <BoardBg rows={store.gameType[store.gameTypeSelectedId].height} cols={store.gameType[store.gameTypeSelectedId].width} height={getBoardContainerStyle.height}/>
        <div className="board" style={getBoardStyle}>
          {getBoardCells}
        </div>
      </div>
      <div className="footer">
        {getFooter}
        {/* hack: add 0 width space to maintain height when empty */}
        {'\u200B'}
      </div>
    </div>
  );
}