import React from 'react';
import './index.css';

import Card from './Card';
import { calculatePoints, calculatePointsByCardNumber, getFirstCardByCardNumber, getNumberOfCardsWithNumber, getRandomCards, getUniqueCardNumbers, hasCardWithNumber, removeFromCardsByCard, removeFromCardsByCardNumber, shuffleDeck } from './helper';
import { CardNumber, CardSuit, ICard, Turn } from './types';
import { alphaBetaAlgorithm } from './algorithm';

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
    if (deck.length === 0) return;

    toggleTurn();
    const [card, ...restDeck] = deck;

    writeToLog(`user ${turn} drawn a card`)
    if (turn === Turn.User) {
      setUserHand([...userHand, card]);
    } else {
      setAiHand([...aiHand, card]);
    }

    if (restDeck) setDeck(restDeck);
    else setDeck([]);
    return card;
  }

  const makeTurn = (card: ICard) => {
    let _board = removeFromCardsByCardNumber(board, card.number);
    let _deck = deck;

    if (card.number === CardNumber.Jack) {
      _board = [];
      _deck = [..._deck, ...board];
    }

    if (card.number === CardNumber.Joker && _deck.length >= 2) {
      const [userNewCard, aiNewCard, ...restDeck] = _deck;
      setUserHand([...removeFromCardsByCard(userHand, card), userNewCard]);
      setAiHand([...removeFromCardsByCard(aiHand, card), aiNewCard]);
      if (restDeck) _deck = restDeck;
      else _deck = [];
    }

    while (_board.length !== 4) {
      if (_deck.length === 0) break;
      const [newCard, ...restDeck] = _deck;
      if (restDeck) _deck = restDeck;
      else _deck = [];
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
    if (deck.length === 0) {
      if (
        !userHand.some((card) => hasCardWithNumber(board, card.number)) &&
        !aiHand.some((card) => hasCardWithNumber(board, card.number))
      ) {
        writeToLog('game has finished');
      }
    }
  }, [deck, aiHand, userHand, board]);

  React.useEffect(() => {
    if (turn === Turn.AI) {
      let card: ICard | null = null;
      // Prefer to draw king or queen as a last card
      if (deck.length === 1 && (
        deck[0].number === CardNumber.King ||
        deck[0].number === CardNumber.Queen
      )) {
        drawCard();
        return;
      }

      if (deck.length === 0) {
        const states = getUniqueCardNumbers(board)
          .filter(cardNumber => hasCardWithNumber(aiHand, cardNumber))
          .map((cardNumber, index) => [calculatePointsByCardNumber(cardNumber), index]);
        if (states.length > 0) {
          const result = alphaBetaAlgorithm({ 
            depth: 0,
            nodeIndex: 0,
            values: states as [number, number][],
            maximizingPlayer: true,
          });

          if (result) {
            const [_, index] = result;
            if (index) {
              card = aiHand[index];
              setAiHand([...removeFromCardsByCard(aiHand, card)]);
              makeTurn(card);
              return;
            }
          }
        }
      }

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

  return (
    <div className="game">
      <div className="row">
        Cards remains: {deck.length}
        {' '}
        <button onClick={drawCard}>Draw card</button>
      </div>
      <div className="row">
        USER points: {userPoints}
      </div>
      <div className="row">
        AI points: {aiPoints}
      </div>
      <div className="row">
        BOARD
        {board.map(card =>
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
