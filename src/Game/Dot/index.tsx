import React from 'react';
import './index.css';
import { IDot } from '../index';

interface IProps {
  dot: IDot;
  style: 'empty' | 'user' | 'captured-by-user' | 'computer' | 'captured-by-computer';
  onSelect: () => void;
}

const Dot: React.FC<IProps> = ({ style = 'available', onSelect, dot }) => {
  return (
    <div className="dotWrapper">
      <div className={`dot ${style}`} onClick={onSelect}></div>
    </div>
  );
}

export default Dot;
