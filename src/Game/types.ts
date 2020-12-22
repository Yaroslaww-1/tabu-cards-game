export enum CardNumber {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A',
  Joker = 'Joker',
}

export enum CardSuit {
  Hearts = '♥',
  Diamonds = '♦',
  Clubs = '♣',
  Spades = '♠',
}

export enum Turn {
  User = 'User',
  AI = 'AI',
}

export interface ICard {
  number: CardNumber;
  suit: CardSuit;
}