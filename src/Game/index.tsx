import React from 'react';
import './index.css';

import Card from './Card';
import { calculatePoints, getFirstCardByCardNumber, getNumberOfCardsWithNumber, getRandomCards, hasCardWithNumber, removeFromCardsByCard, removeFromCardsByCardNumber, shuffleDeck } from './helper';
import { CardNumber, CardSuit, ICard, Turn } from './types';

const Game = () => {
  const [userHand, setUserHand] = React.useState<ICard[]>([]);
  const [userPoints, setUserPoints] = React.useState<number>(0);
  const [userSelection, setUserSelection] = React.useState<ICard | null>(null);

  const [aiHand, setAiHand] = React.useState<ICard[]>([]);
  const [aiPoints, setAiPoints] = React.useState<number>(0);

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

  const drawCard = () => {
    if (deck.length === 0) {
      writeToLog(`game finished`);
      return;
    }

    toggleTurn();
    const [card, ...restDeck] = deck;

    writeToLog(`user ${turn} drawn a card`)
    if (turn === Turn.User) {
      setUserHand([...userHand, card]);
    } else {
      setAiHand([...aiHand, card]);
    }

    if (restDeck) setDeck(restDeck);
    return card;
  }

  const makeTurn = (card: ICard) => {
    let _board = removeFromCardsByCardNumber(board, card.number);
    let _deck = deck;

    if (card.number === CardNumber.Jack) {
      _board = [];
      _deck = [..._deck, card, ...board];
    }

    if (card.number === CardNumber.Joker && _deck.length >= 2) {
      const [userNewCard, aiNewCard, ...restDeck] = _deck;
      setUserHand([...userHand, userNewCard]);
      setAiHand([...aiHand, aiNewCard]);
      if (restDeck) _deck = restDeck;
    }

    while (_board.length !== 4) {
      if (deck.length === 0) break;
      const [newCard, ...restDeck] = _deck;
      if (restDeck) _deck = restDeck;
      _board = [..._board, newCard];
    }

    setDeck(_deck);
    setBoard(_board);

    const points = calculatePoints(card);
    if (turn === Turn.AI) {
      setAiPoints(aiPoints + points);
    } else {
      setUserPoints(userPoints + points);
    }

    writeToLog(`${turn} saved card ${card.number} ${card.suit} and received ${points}`);
    if (userHand.length === 0 || aiHand.length === 0) {
      writeToLog(`game finished`);
      return;
    }
    toggleTurn();
  }

  const onUserSelect = (card: ICard, isFirstPick: boolean) => {
    if (isFirstPick === true) {
      setUserSelection(card);
      writeToLog(`user selected card ${card.number} ${card.suit}`);
      return;
    } else {
      if (userSelection && userSelection.number === card.number) {
        setUserHand([...removeFromCardsByCard(userHand, userSelection)]);
        makeTurn(card);
      }
    }
  }

  React.useEffect(() => {
    if (turn === Turn.AI) {
      let card: ICard | null = null;
      if (hasCardWithNumber(aiHand, CardNumber.King) && hasCardWithNumber(board, CardNumber.King)) {
        card = getFirstCardByCardNumber(aiHand, CardNumber.King)!;
      } else
      if (hasCardWithNumber(aiHand, CardNumber.Queen) && hasCardWithNumber(board, CardNumber.Queen)) {
        card = getFirstCardByCardNumber(aiHand, CardNumber.Queen)!;
      } else
      if (hasCardWithNumber(aiHand, CardNumber.Ace) && hasCardWithNumber(board, CardNumber.Ace)) {
        card = getFirstCardByCardNumber(aiHand, CardNumber.Ace)!;
      } else {
        for (const aiCard of aiHand) {
          if (getNumberOfCardsWithNumber(aiHand, aiCard.number) >= 2 && hasCardWithNumber(board, aiCard.number)) {
            card = aiCard;
            break;
          }
        }
        if (!card) {
          for (const aiCard of aiHand) {
            if (hasCardWithNumber(board, aiCard.number)) {
              card = aiCard;
              break;
            }
          }
        }
      }

      if (card) {
        setAiHand([...removeFromCardsByCard(aiHand, card)]);
        makeTurn(card);
      } else {
        drawCard();
      }
      
      return;
    }
  }, [turn]);

  React.useEffect(() => {
    // console.log(board);
    for (const item of board) {
      if (!item) {
        console.log('AAAAAAAAAAAAAAAAAAAA', board);
      }
    }
  }, [board]);

  console.log(board);

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
        USER points: {userPoints}
      </div>
      <div className="row">
        AI points: {aiPoints}
      </div>
      <div className="row">
        BOARD
        {board && board.map(card =>
          <Card
            key={`${card.number} ${card.suit}`}
            card={card}
            onClick={() => onUserSelect(card, false)}
            isAvailable={false}
          />
        )}
      </div>
      <div className="row">
        USER hand
        {userHand.map(card =>
          <Card
            key={`${card.number} ${card.suit}`}
            card={card}
            onClick={() => onUserSelect(card, true)}
            isAvailable={hasCardWithNumber(board, card.number)}
          />
        )}
      </div>
      <div className="row">
        AI hand
        {aiHand.map(card =>
          <Card
            key={`${card.number} ${card.suit}`}
            card={card}
            onClick={() => {}}
            isAvailable={hasCardWithNumber(board, card.number)}
          />
        )}
      </div>
      <div className="log">
        {log.map((message) => <div>{`${message}\n`}</div>)}
      </div>
    </div>
  );
}

export default Game;
