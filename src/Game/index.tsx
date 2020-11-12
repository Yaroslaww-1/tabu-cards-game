import React from 'react';
import Dot from './Dot';
import './index.css';

export interface IDot {
  id: number;
  x: number;
  y: number;
}

export enum DotType {
  empty = 0,
  user = 1,
  capturedByUser = 2,
  computer = 3,
  capturedByComputer = 4,
}

function Game() {
  const FIELD_SIZE = 8;
  const [field, setField] = React.useState<DotType[][]>(Array.from(Array(FIELD_SIZE), () => Array(FIELD_SIZE).fill(DotType.empty)))

  const getDotStyle = ({ x, y }: IDot) => {
    if (field[x][y] === DotType.empty) return 'empty';
    if (field[x][y] === DotType.user) return 'user';
    if (field[x][y] === DotType.capturedByUser) return 'captured-by-user';
    if (field[x][y] === DotType.computer) return 'computer';
    return 'captured-by-computer';
  }

  const copyArray = <T extends any>(array: T[][]): T[][] => JSON.parse(JSON.stringify(array));

  const onDotSelect = (dot: IDot) => {
    if (field[dot.x][dot.y] === DotType.empty) {
      let newField = copyArray(field);
      console.log(newField);
      newField[dot.x][dot.y] = DotType.user;
      setField(newField);

      newField = recalculateCapturedFields(
        dot,
        DotType.user,
        DotType.capturedByUser,
        DotType.computer,
        copyArray(newField),
      );

      const states: [number, number][] = [];
      let actions: { x: number, y: number }[] = [];
      const getValues = (state: DotType[][], depth: number, player: DotType) => {
        if (depth === 3) {
          return;
        }
        for (let x = 0; x < FIELD_SIZE; x++) {
          for (let y = 0; y < FIELD_SIZE; y++) {
            if (state[x][y] === DotType.empty) {
              const newState = copyArray(state);
              newState[x][y] = player;
              const heuristicValue = getHeuristicValue(
                newState,
                player === DotType.user ? DotType.capturedByUser : DotType.capturedByComputer,
                player === DotType.user ? DotType.capturedByComputer : DotType.capturedByUser,
                player,
                player === DotType.user ? DotType.computer : DotType.user,
                x,
                y
              );
              states.push([heuristicValue, states.length]);
              actions.push({ x, y });
              getValues(newState, depth + 1, player === DotType.user ? DotType.computer : DotType.user);
            }
          }
        }
      }
      getValues(copyArray(newField), 0, DotType.computer);
      try {
        const [_, index] = alphaBetaAlgorithm({ 
          depth: 0, nodeIndex: 0, values: states, maximizingPlayer: true, alpha: MIN, beta: MAX
        });
        console.log(getHeuristicForDot(newField, 1, 3, DotType.computer, DotType.user));
        const { x, y } = actions[index];
        newField[x][y] = DotType.computer;
        setField(newField);
        newField = recalculateCapturedFields(
          { x, y, id: x + y * 1000 },
          DotType.computer,
          DotType.capturedByComputer,
          DotType.user,
          copyArray(newField),
        );
        setField(newField);
      } catch(e) {}
    }
  }

  const recalculateCapturedFields = (
    dot: IDot,
    currentPlayer: DotType,
    capturedByCurrentPlayer: DotType,
    opponent: DotType,
    _field: DotType[][],
  ): DotType[][] => {
    const finalField = copyArray(_field);
    const isEmpty = (x: number, y: number) => finalField[x][y] !== currentPlayer;
  
    let isClosed: boolean = true;
    let visited: {x: number, y: number}[] = [];

    const isVisitedContains = (x: number, y: number) => visited.some(e => e.x === x && e.y === y);

    const dfs = (x: number, y: number) => {
      visited.push({ x, y });
      if (x === 0 || x === FIELD_SIZE - 1 || y === 0 || y === FIELD_SIZE - 1 || !isClosed) {
        isClosed = false;
        return;
      }
      if (x < FIELD_SIZE - 1 && isEmpty(x + 1, y) && !isVisitedContains(x + 1, y)) {
        dfs(x + 1, y);
      }
      if (y < FIELD_SIZE - 1 && isEmpty(x, y + 1) && !isVisitedContains(x, y + 1)) {
        dfs(x, y + 1);
      }
      if (x > 0 && isEmpty(x - 1, y) && !isVisitedContains(x - 1, y)) {
        dfs(x - 1, y);
      }
      if (y > 0 && isEmpty(x, y - 1) && !isVisitedContains(x, y - 1)) {
        dfs(x, y - 1);
      }
    }

    const _updateField = () => {
      if (!isClosed) {
        isClosed = true;
        visited = [];
      };
      for (const { x, y } of visited) {
        if (finalField[x][y] === opponent) {
          finalField[x][y] = capturedByCurrentPlayer;
        }
      }
      isClosed = true;
      visited = [];
    }

    if (dot.x < FIELD_SIZE - 1) {
      dfs(dot.x + 1, dot.y);
      _updateField();
    }

    if (dot.y < FIELD_SIZE - 1) {
      dfs(dot.x, dot.y + 1);
      _updateField();
    }

    if (dot.x > 0) {
      dfs(dot.x - 1, dot.y);
      _updateField();
    }

    if (dot.y > 0) {
      dfs(dot.x, dot.y - 1);
      _updateField();
    }

    return finalField;
  }

  const MIN = -1000;
  const MAX = 1000;
  const alphaBetaAlgorithm = (
    { depth, maximizingPlayer, nodeIndex, values, alpha, beta } :
    { 
      depth: number,
      maximizingPlayer: boolean,
      nodeIndex: number,
      values: [number, number][],
      alpha: number,
      beta: number
    }
  ): [number, number] => {
    if (depth === 3) {
      return values[nodeIndex];
    }

    if (maximizingPlayer) {
      let best = MIN;
      let bestIndex = 0;

      for (let i = 0; i < FIELD_SIZE * FIELD_SIZE; i++) {
        const [val, index] = alphaBetaAlgorithm({ depth: depth + 1, nodeIndex: nodeIndex * 2 + i, maximizingPlayer: false, values, alpha, beta });
        if (val > best) {
          best = val;
          bestIndex = index;
        }
        alpha = Math.max(best, alpha);
        
        if (beta <= alpha)
          break;
      }

      return [best, bestIndex];
    } else {
      let best = MAX;
      let bestIndex = 0;

      for (let i = 0; i < FIELD_SIZE * FIELD_SIZE; i++) {
        const [val, index] = alphaBetaAlgorithm({ depth: depth + 1, nodeIndex: nodeIndex * 2 + i, maximizingPlayer: true, values, alpha, beta });
        if (val < best) {
          best = val;
          bestIndex = index;
        }
        beta = Math.min(best, beta);
        
        if (beta <= alpha)
          break;
      }

      return [best, bestIndex];
    }
  }

  const getHeuristicValue = (
    state: DotType[][],
    playerCaptured: DotType,
    opponentCaptured: DotType,
    player: DotType,
    opponent: DotType,
    x: number,
    y: number,
  ): number => {
    let playerCapturedDots = 0;
    let opponentCapturedDots = 0;
    for (let x = 0; x < state.length; x++) {
      for (let y = 0; y < state.length; y++) {
        if (state[x][y] === playerCaptured) playerCapturedDots++;
        if (state[x][y] === opponentCaptured) opponentCapturedDots++;
      }
    }
    const minMax = playerCapturedDots - opponentCapturedDots;
    const heuristicForDot = getHeuristicForDot(state, x, y, player, opponent);
    return 10 * (-heuristicForDot) + 100 * minMax;
  }; 

  const getHeuristicForDot = (state: DotType[][], x: number, y: number, player: DotType, opponent: DotType) => {
    let max = -1;
    if (x > 0 && y > 0 && x < FIELD_SIZE - 1 && y < FIELD_SIZE - 1 &&
      state[x][y-1] === player &&
      state[x][y+1] === player &&
      state[x-1][y] === opponent &&
      state[x+1][y] === opponent
    ) max = Math.max(max, 1.0);

    if (x > 0 && y > 0 && x < FIELD_SIZE - 1 && y < FIELD_SIZE - 1 &&
      state[x][y-1] === player &&
      (state[x][y+1] === player || state[x][y+1] === DotType.empty) &&
      (state[x-1][y] === player || state[x-1][y] === DotType.empty) &&
      state[x+1][y] === opponent &&
      state[x-1][y-1] === opponent
    ) max = Math.max(max, 0.9);

    if (x > 0 && y > 1 && x < FIELD_SIZE - 1 && y < FIELD_SIZE &&
      state[x][y-1] === player &&
      state[x][y-2] === player &&
      (state[x-1][y] === player || state[x-1][y] === DotType.empty) &&
      (state[x+1][y] === player || state[x+1][y] === DotType.empty) &&
      state[x-1][y-1] === opponent &&
      state[x+1][y-1] === opponent
    ) max = Math.max(max, 0.9);

    if (x > 0 && y > 0 && x < FIELD_SIZE - 1 && y < FIELD_SIZE - 1 &&
      state[x-1][y-1] === opponent &&
      (state[x-1][y+1] === player || state[x-1][y+1] === DotType.empty) &&
      state[x+1][y+1] === opponent &&
      (state[x+1][y-1] === player || state[x+1][y-1] === DotType.empty)
    ) max = Math.max(max, 0.05);

    if (x > 1 && y > 0 && x < FIELD_SIZE - 1 && y < FIELD_SIZE - 2 &&
      state[x-1][y-1] === DotType.empty &&
      state[x-1][y] === DotType.empty &&
      state[x][y+1] === DotType.empty &&
      state[x+1][y+1] === DotType.empty &&
      state[x][y+2] === player &&
      state[x-1][y+1] === opponent &&
      state[x-2][y] === player
    ) max = Math.max(max, 0.8);

    if (x > 1 && y > 0 && x < FIELD_SIZE - 1 && y < FIELD_SIZE - 2 &&
      state[x-1][y-1] === DotType.empty &&
      state[x-1][y] === DotType.empty &&
      state[x][y+1] === DotType.empty &&
      state[x+1][y+1] === DotType.empty &&
      state[x][y+2] === player &&
      state[x-1][y+1] === opponent &&
      state[x-2][y] === player
    ) max = Math.max(max, 0.8);

    if (x >= 0 && y > 1 && x < FIELD_SIZE - 3 && y < FIELD_SIZE &&
      (state[x][y-1] === player || state[x][y-1] === DotType.empty) &&
      (state[x][y-2] === player || state[x][y-2] === DotType.empty) &&
      state[x+1][y-1] === DotType.empty &&
      state[x+1][y-2] === DotType.empty &&
      state[x+1][y] === DotType.empty &&
      (state[x+2][y] === player || state[x+2][y] === DotType.empty) &&
      state[x+2][y-1] === opponent &&
      state[x+3][y-2] === opponent &&
      (state[x+2][y-2] === player || state[x+2][y-2] === DotType.empty)
    ) max = Math.max(max, 0.01);

    if (x > 0 && y > 0 && x < FIELD_SIZE && y < FIELD_SIZE - 1 &&
      state[x][y-1] === opponent &&
      state[x][y+1] === opponent &&
      state[x-1][y] === opponent
    ) max = Math.max(max, -0.5);

    if (x >= 0 && y > 0 && x < FIELD_SIZE - 1 && y < FIELD_SIZE &&
      state[x][y-1] === opponent &&
      state[x+1][y-1] === opponent &&
      state[x+1][y] === opponent
    ) max = Math.max(max, -0.5);

    return max;
  }

  const getDotElements = () => {
    let x = 0;
    let y = 0;
    return [...new Array(FIELD_SIZE * FIELD_SIZE)].map((_, index) => {
      const dot = {
        id: index,
        x: y,
        y: x,
      }
      x ++;
      if (x >= FIELD_SIZE) {
        x = 0;
        y ++;
      }

      return <Dot key={index} dot={dot} style={getDotStyle(dot)} onSelect={() => onDotSelect(dot)} />
    })
  }

  return (
    <div className="game">
      {getDotElements()}
    </div>
  );
}

export default Game;
