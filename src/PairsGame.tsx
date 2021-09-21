import emojis, { Emoji } from './emojis';
import React, { useState } from 'react';
//differentiated union type

/** Whether a card has been turned, or two, or none yet.*/
type TurnStatus =
    | { title: 'noneTurned' }
    | { title: 'oneTurned'; firstCard: Card }
    | { title: 'twoTurned'; firstCard: Card; secondCard: Card };

interface Card {
    isFaceUp: boolean;
    emoji: string;
    id: number;
    isRemoved: boolean;
}

export default function PairsGame() {
    const [clickCount, setClickCount] = useState(0);
    const [turnStatus, setTurnStatus] = useState<TurnStatus>({
        title: 'noneTurned'
    });

    const [deck, setDeck] = useState<Card[]>(makeEmojisDeck());

    function resetGame() {
        setClickCount(0);
        setDeck(makeEmojisDeck());
        setTurnStatus({ title: 'noneTurned' });
    }

    function areTwoCardsFaceUp() {
        return turnStatus.title === 'twoTurned';
    }
    function cardsRemain() {
        return deck.filter(c => !c.isRemoved).length > 0;
    }

    function shuffle<T>(arr: T[]): T[] {
        return [...arr].sort((a, b) => Math.random() - 0.5);
    }
    function makeEmojisDeck(): Card[] {
        const emojisToUse = [...emojis]
            .sort((a, b) => Math.random() - 0.5) //shuffle
            .slice(0, 8); //take 8 emojis.  We'll instantiate double to make the deck.

        function makeEmojiCard(e: Emoji, id: number): Card {
            return { emoji: e, id, isFaceUp: false, isRemoved: false };
        }
        return shuffle(
            emojisToUse.flatMap((e, ix) => [
                makeEmojiCard(e, 2 * ix),
                makeEmojiCard(e, 2 * ix + 1)
            ])
        );
    }

    function handleAcknowledge() {
        if (turnStatus.title === 'twoTurned') {
            const { firstCard: a, secondCard: b } = turnStatus;
            if (a.emoji === b.emoji) {
                a.isRemoved = true;
                b.isRemoved = true;
            }
            //in either case, unflip.
            a.isFaceUp = false;
            b.isFaceUp = false;
            setTurnStatus({ title: 'noneTurned' });
            if (!cardsRemain()) {
                resetGame();
            }
        }
    }

    function handleClickCard(c: Card) {
        if (turnStatus.title === 'twoTurned') {
            return;
        }

        if (c.isRemoved) {
            console.log('card has been removed!');
            return;
        }

        if (c.isFaceUp) {
            return;
        }

        c.isFaceUp = true;
        setClickCount(prev => prev + 1);

        if (turnStatus.title === 'noneTurned') {
            setTurnStatus({ title: 'oneTurned', firstCard: c });
            return;
        }
        if (turnStatus.title === 'oneTurned') {
            setTurnStatus({ title: 'twoTurned', firstCard: turnStatus.firstCard, secondCard: c });
            return;
        }
    }

    return (
        <div className="mat">
            <div className="cardset">
                {deck.map((c, ix) => (
                    <CardView card={c} key={ix} handleClickCard={handleClickCard} />
                ))}
            </div>
            <div>TurnStatus: {turnStatus.title}</div>
            <div>Click count: {clickCount}</div>
            <button
                className={areTwoCardsFaceUp() ? 'show' : 'hide'}
                onClick={handleAcknowledge}
            >
                acknowledge
            </button>
        </div>
    );
}
interface CardProps {
    handleClickCard: (c: Card) => void;
    card: Card;
}
function CardView(props: CardProps) {
    return (
        <div
            onClick={() => props.handleClickCard(props.card)}
            className={
                'card ' +
                (props.card.isFaceUp ? 'face-up' : '') +
                ' ' +
                (props.card.isRemoved ? 'removed' : '')
            }
        >
            {!props.card.isRemoved && props.card.emoji}
        </div>
    );
}
