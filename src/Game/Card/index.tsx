import React from 'react';
import './index.css';
import { ICard } from '../types';

interface IProps {
  card: ICard;
  onClick: () => void;
  isAvailable: boolean;
}

const Card: React.FC<IProps> = ({ onClick, card, isAvailable }) => {
  return (
    <div className="cardRoot">
      <div className={`card ${isAvailable ? 'isAvailable' : ''}`} onClick={onClick}>
        {card.suit}
        {' '}
        {card.number}
      </div>
    </div>
  );
}

export default Card;
