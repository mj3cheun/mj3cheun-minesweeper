export enum GameReducerTypes {
  ResetBoard,
  SetGameTypeSelectedId,
  SetCustom,
  SetTime,
  SetFlags,
  SetIsStarted,
  SetIsFailed,
  SetBoard,
};

export function gameReducer(state, action) {
  switch (action.type) {
    case GameReducerTypes.ResetBoard: {
      state.gameState = {
        board: {} as GameState,
        boardIdx: [] as number[],
        numFlags: 0,
        numReveals: 0,
        isStarted: false,
      };
      state.time = 0;
      return {...state};
    }
    case GameReducerTypes.SetGameTypeSelectedId: {
      return {
        ...state,
        gameTypeSelectedId: action.id,
      };
    }
    case GameReducerTypes.SetCustom: {
      return {
        ...state,
        gameType: {
          ...state.gameType,
          Custom: action.customSettings
        }
      }
    }
    case GameReducerTypes.SetTime: {
      return {
        ...state,
        time: action.time,
      };
    }
    case GameReducerTypes.SetFlags: {
      return {
        ...state,
        gameState: {
          ...state.gameState,
          numFlags: action.numFlags,
        }
      }
    }
    case GameReducerTypes.SetIsStarted: {
      return {
        ...state,
        gameState: {
          ...state.gameState,
          isStarted: action.started,
        }
      };
    }
    case GameReducerTypes.SetIsFailed: {
      return {
        ...state,
        gameState: {
          ...state.gameState,
          isFailed: action.failed,
        }
      };
    }
    case GameReducerTypes.SetBoard: {
      const gameType = state.gameType[state.gameTypeSelectedId];
      return {
        ...state,
        gameState: {
          ...state.gameState,
          numReveals: action.numReveals,
          board: action.board,
          boardIdx: Object.keys(action.board),
          isComplete: gameType.height * gameType.width - gameType.mines === action.numReveals
        }
      };
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

interface GameSettings {
  height: number;
  width: number;
  mines: number;
  marks: boolean;
}

export enum CellStatus {
  None,
  Revealed,
  Flagged,
}

type GameState = {[squareId: number]: { status: CellStatus, minedProx: number }};

export interface StoreState {
  gameType: {
      [typeId: string]: GameSettings;
  };
  gameTypeSelectedId: string;
  gameState: {
      board: GameState;
      boardIdx: number[];
      numFlags: number;
      numReveals: number,
      isStarted: boolean;
      isFailed: boolean;
      isComplete: boolean;
  };
  time: number;
};

const initialStore = {
  gameType: {
    Beginner: {
      height: 9,
      width: 9,
      mines: 10,
      marks: false,
    },
    Intermediate: {
      height: 16,
      width: 16,
      mines: 40,
      marks: false,
    },
    Expert: {
      height: 16,
      width: 30,
      mines: 99,
      marks: false,
    },
    Custom: {
      height: 25,
      width: 30,
      mines: 145,
      marks: false,
    }
  },
  gameTypeSelectedId: 'Custom',
  // gameSettings: {},
  gameState: {
    board: {} as GameState,
    boardIdx: [] as number[],
    numFlags: 0,
    numReveals: 0,
    isStarted: false,
    isFailed: false,
    isComplete: false,
  },
  time: 0,
};

export const initializeStore = (): StoreState => {
  // deep copy object
  const store = JSON.parse(JSON.stringify(initialStore as StoreState));
  return store;
}