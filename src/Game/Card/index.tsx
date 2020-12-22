import React from 'react';
import './index.css';
import { ICard } from '../types';

interface IProps {
  card: ICard;
  onClick: () => void;
}

const Card: React.FC<IProps> = ({ onClick, card }) => {
  return (
    <div className="cardRoot">
      <div className={`card`} onClick={onClick}>
        {card.suit}
        {' '}
        {card.number}
      </div>
    </div>
  );
}

export default Card;
