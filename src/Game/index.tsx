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
  const FIELD_SIZE = 15;
  const field: number[][] = new Array(FIELD_SIZE).fill(new Array(FIELD_SIZE).fill(DotType.empty));
  const generateDots = (): IDot[] => {
    const dotsCount = FIELD_SIZE * FIELD_SIZE;
    let x = 0;
    let y = 0;
    return [...new Array(dotsCount)].map((_, index) => {
      const dot = {
        id: index,
        x,
        y,
      }
      x ++;
      if (x >= FIELD_SIZE) {
        x = 0;
        y ++;
      }
      return dot;
    });
  }
  const dots: IDot[] = generateDots();

  const [userDots, setUserDots] = React.useState<IDot[]>([]);
  const [userWinDots, setUserWinDots] = React.useState<IDot[]>([]);

  const [computerDots, setComputerDots] = React.useState<IDot[]>([]);
  const [computerWinDots, setComputerWinDots] = React.useState<IDot[]>([]);

  const [availableDots, setAvailableDots] = React.useState<IDot[]>([...dots]);

  const getDotStyle = (dot: IDot) => {
    if (userDots.some(_dot => _dot.id === dot.id)) return 'user';
    if (userWinDots.some(_dot => _dot.id === dot.id)) return 'user-win';
    if (computerDots.some(_dot => _dot.id === dot.id)) return 'computer';
    if (computerWinDots.some(_dot => _dot.id === dot.id)) return 'computer-win';
    return 'available';
  }

  const onDotSelect = (dot: IDot) => {
    if (availableDots.some(_dot => _dot.id === dot.id)) {
      removeDotFromAvailable(dot);
      setUserDots([...userDots, dot]);

      const computerDot = availableDots[getRandomInt(availableDots.length)];
      removeDotFromAvailable(computerDot);
      setComputerDots([...computerDots, computerDot]);
    } else {
      console.log('does not includes');
    }
  }

  const removeDotFromAvailable = (dot: IDot) => setAvailableDots((dots) => [...dots.filter(_dot => _dot.id !== dot.id)]);

  return (
    <div className="game">
      {dots.map((dot) => <Dot dot={dot} style={getDotStyle(dot)} onSelect={() => onDotSelect(dot)} key={dot.id} />)}
    </div>
  );
}

export default Game;
