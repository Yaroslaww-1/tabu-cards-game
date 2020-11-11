import React from 'react';
import Dot from './Dot';
import './index.css';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

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
  const FIELD_SIZE = 10;
  const [field, setField] = React.useState<DotType[][]>(Array.from(Array(FIELD_SIZE), () => Array(FIELD_SIZE).fill(DotType.empty)))

  const getDotStyle = ({ x, y }: IDot) => {
    if (field[x][y] === DotType.empty) return 'empty';
    if (field[x][y] === DotType.user) return 'user';
    if (field[x][y] === DotType.capturedByUser) return 'captured-by-user';
    if (field[x][y] === DotType.computer) return 'computer';
    return 'captured-by-computer';
  }

  const copyArray = <T extends any>(array: T[][]): T[][] => {
    // const newArray = [];
    // for (let i = 0; i < array.length; i++) {
    //   newArray.push(array[i].slice());
    // }
    return JSON.parse(JSON.stringify(array));
  }

  // React.useEffect(() => {
  //   console.log('field changing', field);
  // }, [field]);

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
        if (depth === 1) {
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
                player === DotType.user ? DotType.capturedByComputer : DotType.capturedByUser
              );
              states.push([heuristicValue, states.length]);
              actions.push({ x, y });
              getValues(newState, depth + 1, player === DotType.user ? DotType.computer : DotType.user);
            }
          }
        }
      }
      getValues(copyArray(newField), 0, DotType.computer);
            // console.log('actions.length', actions.length);
      const [_, index] = alphaBetaAlgorithm({ 
        depth: 0, nodeIndex: 0, values: states, maximizingPlayer: true, alpha: MIN, beta: MAX
      });
            // while (true) {
            //   console.log(FIELD_SIZE);
            //   const ranX = getRandomInt(FIELD_SIZE);
            //   const ranY = getRandomInt(FIELD_SIZE);
            //   if (field[ranX][ranY] === DotType.empty) {
            //     ac = { x: ranX, y: ranY };
            //     break;
            //   }
            // }
      const { x, y } = actions[index];
            // if (_newField[2][3] === DotType.computer) return; 
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
      console.log(x, y);
      if (x === 0 || x === FIELD_SIZE - 1 || y === 0 || y === FIELD_SIZE - 1 || !isClosed) {
        isClosed = false;
        console.log('return');
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
    if (depth === 1) {
      return values[nodeIndex];
    }

    if (maximizingPlayer) {
      let best = MIN;
      let bestIndex = 0;

      for (let i = 0; i < 2; i++) {
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

      for (let i = 0; i < 2; i++) {
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

  const getHeuristicValue = (state: DotType[][], playerCaptured: DotType, opponentCaptured: DotType): number => {
    let playerCapturedDots = 0;
    let opponentCapturedDots = 0;
    for (let x = 0; x < state.length; x++) {
      for (let y = 0; y < state.length; y++) {
        if (state[x][y] === playerCaptured) playerCapturedDots++;
        if (state[x][y] === opponentCaptured) opponentCapturedDots++;
      }
    }
    return playerCapturedDots - opponentCapturedDots;
  }; 

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
