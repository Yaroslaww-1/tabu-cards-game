import { CardNumber, ICard } from './types';

export const getRandomCards = ({ deck, size, isValid = () => true }: { deck: ICard[], size: number, isValid?: (card: ICard) => boolean; }) => {
  const cards: ICard[] = [];

  const isExists = (card: ICard) => {
    return cards.some(_card => _card.number === card.number && _card.suit === card.suit);
  }

  while(cards.length !== size) {
    const card = deck[Math.floor(Math.random() * deck.length)];
    if (!isExists(card) && isValid(card)) cards.push(card);
  }

  return {
    cards,
    rest: deck.filter(card => !isExists(card)),
  }
}

export const calculatePoints = (card: ICard) => {
  if (card.number === CardNumber.King) return 12;
  if (card.number === CardNumber.Queen) return 11;
  if (card.number === CardNumber.Ace) return 1;
  return 0;
}

export const calculatePointsByCardNumber = (cardNumber: CardNumber) => {
  if (cardNumber === CardNumber.King) return 12;
  if (cardNumber === CardNumber.Queen) return 11;
  if (cardNumber === CardNumber.Ace) return 1;
  return 0;
}

export const removeFromCardsByCard = (cards: ICard[], card: ICard) => cards.filter(_card => {
  if (_card.number === card.number && _card.suit === card.suit) return false;
  return true;
});

export const removeFromCardsByCardNumber = (cards: ICard[], cardNumber: CardNumber) => cards.filter(_card => {
  if (_card.number === cardNumber) return false;
  return true;
});

export const shuffleDeck = (deck: ICard[]) => 
  [...deck].reduceRight((res: ICard[], _, __, arr) => 
    (res.push(
      deck.splice(0 | Math.random() * deck.length, 1)[0]
    ),
    res),
  []);

export const hasCardWithNumber = (cards: ICard[], cardNumber: CardNumber) => {
  return cards.some(card => card.number === cardNumber);
}

export const getNumberOfCardsWithNumber = (cards: ICard[], cardNumber: CardNumber) => {
  return cards.filter(card => card.number === cardNumber).length;
}

export const getFirstCardByCardNumber = (cards: ICard[], cardNumber: CardNumber) => {
  for (const card of cards) {
    if (card.number === cardNumber) return card;
  }
}

export const getUniqueCardNumbers = (cards: ICard[]): CardNumber[] => {
  const uniqueCards: ICard[] = [];
  for (const card of cards) {
    if (!hasCardWithNumber(uniqueCards, card.number)) {
      uniqueCards.push(card);
    }
  }
  return uniqueCards.map(card => card.number);
}