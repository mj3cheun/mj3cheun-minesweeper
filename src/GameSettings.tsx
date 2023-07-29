import React, { useState, useCallback, useMemo, memo } from 'react';

import { GameReducerTypes } from './store.ts';

function GameSettings({ gameType, gameTypeSelectedId, dispatch }) {
  const [customSettings, setCustomSetting] = useState(gameType.Custom);
  const [selectedId, setGameTypeSelectedId] = useState(gameTypeSelectedId);

  const setCustomValue = useCallback((settingType, value) => {
    setCustomSetting({
      ...customSettings,
      [settingType]: Number(value),
    });
  }
  , [customSettings]);

  const handleNewGame = useCallback(() => {
    const { height, width, mines } = customSettings;

    // validate custom settings
    if(
      (!isNaN(height) && height > 0) &&
        (!isNaN(width) && width > 0) &&
        (!isNaN(mines) && mines > 0 && mines < height * height - 8)
    ) {
      dispatch({type: GameReducerTypes.SetGameTypeSelectedId, id: selectedId});
      dispatch({type: GameReducerTypes.SetCustom, customSettings});
      dispatch({type: GameReducerTypes.ResetBoard})
    } else {
      setCustomSetting(gameType.Custom);
    }
  }, [dispatch, gameType, customSettings, selectedId]);

  const gameTypeRows = useMemo(() => {
    const gameTypeKeys = Object.keys(gameType);
    const output: any[] = [];
    gameTypeKeys.forEach(key => {
      const settings = gameType[key];
      if(key !== 'Custom') {
        output.push(
          <tr key={key}>
            <td className="name">
              <label>
                <input type="radio" name={`select-${key}`} checked={selectedId === key} onChange={() => setGameTypeSelectedId(key)}/>
                {key}
              </label>
            </td>
            <td className="height">
              {settings.height}
            </td>
            <td className="width">
              {settings.width}
            </td>
            <td className="mines">
              {settings.mines}
            </td>
          </tr>
        );
      } else {
        output.push(
          <tr key={key}>
            <td className="name">
              <label>
                <input type="radio" name={`select-${key}`} checked={selectedId === key} onChange={() => setGameTypeSelectedId(key)}/>
                {key}
              </label>
            </td>
            <td className="height">
              <input name={`height-${key}`} value={customSettings.height} onChange={(e) => setCustomValue('height', e.target.value)}/>
            </td>
            <td className="width">
              <input name={`width-${key}`} value={customSettings.width} onChange={(e) => setCustomValue('width', e.target.value)}/>
            </td>
            <td className="mines">
              <input name={`mines-${key}`} value={customSettings.mines} onChange={(e) => setCustomValue('mines', e.target.value)}/>
            </td>
          </tr>
        );
      }
    })
    return output;
  }, [gameType, customSettings, selectedId, setCustomValue]);

  return (
    <div className="GameSettings">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Height</th>
            <th>Width</th>
            <th>Mines</th>
          </tr>
        </thead>
        <tbody>
          {gameTypeRows}
        </tbody>
      </table>
      <button onClick={handleNewGame}>New Game</button>
    </div>
  );
}

// no other component besides this one will drive changes to props
// therefore its safe to prevent most external props change from forcing re-render
export default memo(GameSettings, (prevProps, nextProps) => prevProps.dispatch === nextProps.dispatch);