import React from 'react';
import './index.css';

import Card from './Card';
import { calculatePoints, getRandomCards, removeFromCardsByCard, removeFromCardsByCardNumber, shuffleDeck } from './helper';
import { CardNumber, CardSuit, ICard, Turn } from './types';

const Game = () => {
  const [userHand, setUserHand] = React.useState<ICard[]>([]);
  const [userSavedCards, setUserSavedCards] = React.useState<ICard[]>([]);
  const [userSelection, setUserSelection] = React.useState<ICard | null>(null);

  const [aiHand, setAiHand] = React.useState<ICard[]>([]);
  const [aiSavedCards, setAiSavedCards] = React.useState<ICard[]>([]);

  const [deck, setDeck] = React.useState<ICard[]>([]);
  const [board, setBoard] = React.useState<ICard[]>([]);

  const [turn, setTurn] = React.useState<Turn>(Turn.User);
  const toggleTurn = () => setTurn((turn) => turn === Turn.User ? Turn.AI : Turn.User);

  const [log, setLog] = React.useState<string[]>(['Game starts']);
  const writeToLog = (message: string) => setLog([...log, message]);

  React.useEffect(() => {
    const newDeck: ICard[] = [];
    for (const cardNumber of Object.values(CardNumber)) {
      for (const cardSuit of Object.values(CardSuit)) {
        newDeck.push({
          number: cardNumber as CardNumber,
          suit: cardSuit as CardSuit,
        })
      }
    }

    const shuffledDeck = shuffleDeck(newDeck);

    let { cards: newBoard, rest: deckAfterBoardFilled } = getRandomCards({
      deck: shuffledDeck,
      size: 4,
      isValid: (card) => card.number !== CardNumber.Jack && card.number !== CardNumber.Joker
    });
    setBoard(newBoard);

    const { cards: newUserHand, rest: deckAfterUserFilled } = getRandomCards({ deck: deckAfterBoardFilled, size: 5 });
    setUserHand(newUserHand);

    const { cards: newAiHand, rest: deck } = getRandomCards({ deck: deckAfterUserFilled, size: 5 });
    setAiHand(newAiHand);

    setDeck(deck);
  }, []);

  React.useEffect(() => {
  }, [turn]);

  const drawCard = () => {
    toggleTurn();

    const [card, ...restDeck] = deck;

    writeToLog(`user ${turn} drawn a card`)
    if (turn === Turn.User)
      setUserHand([...userHand, card]);
    else
      setAiHand([...aiHand, card]);

    setDeck(restDeck);
    return card;
  }

  const onUserSelect = (card: ICard, isFirstPick: boolean) => {
    if (isFirstPick === true) {
      setUserSelection(card);
      writeToLog(`user selected card ${card.number} ${card.suit}`);
      return;
    } else {
      if (userSelection && userSelection.number === card.number) {
        setUserHand([...removeFromCardsByCard(userHand, userSelection)]);
        
        let _board = [...removeFromCardsByCardNumber(board, card.number)];
        let _deck = deck;

        while (_board.length !== 4) {
          const [newCard, ...restDeck] = _deck;
          _deck = [...restDeck];
          _board = [..._board, newCard];
        }

        setDeck(_deck);
        setBoard(_board);

        toggleTurn();
        writeToLog(`user saved card ${card.number} ${card.suit} and received ${calculatePoints(card)}`);
      }
    }
  }

  return (
    <div className="game">
      <div className="row">
        Cards remains: {deck.length}
        {' '}
        <button onClick={drawCard}>Draw card</button>
        {' '}
        Turn: {turn}
      </div>
      <div className="row">
        BOARD
        {board.map(card => <Card key={`${card.number} ${card.suit}`} card={card} onClick={() => onUserSelect(card, false)} />)}
      </div>
      <div className="row">
        USER hand
        {userHand.map(card => <Card key={`${card.number} ${card.suit}`} card={card} onClick={() => onUserSelect(card, true)} />)}
      </div>
      <div className="row">
        AI hand
        {aiHand.map(card => <Card key={`${card.number} ${card.suit}`} card={card} onClick={() => {}} />)}
      </div>
      <div className="log">
        {log.map((message) => <div>{`${message}\n`}</div>)}
      </div>
    </div>
  );
}

export default Game;
