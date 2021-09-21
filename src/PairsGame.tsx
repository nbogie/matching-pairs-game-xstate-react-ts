import emojis, { Emoji } from './emojis';
import React, { useState } from 'react';
//differentiated union type
type PickStatus =
    | { status: 'starting' }
    | { status: 'partial'; card: Card }
    | { status: 'full'; firstCard: Card; secondCard: Card };

interface Card {
    isFlipped: boolean;
    emoji: string;
    id: number;
    isRemoved: boolean;
}

export default function PairsGame() {
    const [clickCount, setClickCount] = useState(0);
    const [pickStatus, setPickStatus] = useState<PickStatus>({
        status: 'starting'
    });

    const [deck, setDeck] = useState<Card[]>(makeEmojisDeck());

    function resetGame() {
        setClickCount(0);
        setDeck(makeEmojisDeck());
        setPickStatus({ status: 'starting' });
    }

    function isEndOfPair() {
        return pickStatus.status === 'full';
    }
    function cardsRemain() {
        return deck.filter(c => !c.isRemoved).length > 0;
    }

    function shuffle<T>(arr: T[]): T[] {
        return [...arr].sort((a, b) => Math.random() - 0.5);
    }
    function makeEmojisDeck(): Card[] {
        const emojisToUse = [...emojis]
            .sort((a, b) => Math.random() - 0.5)
            .slice(0, 8);

        function makeEmojiCard(e: Emoji, id: number): Card {
            return { emoji: e, id, isFlipped: false, isRemoved: false };
        }
        return shuffle(
            emojisToUse.flatMap((e, ix) => [
                makeEmojiCard(e, 2 * ix),
                makeEmojiCard(e, 2 * ix + 1)
            ])
        );
    }

    function handleAcknowledge() {
        if (pickStatus.status === 'full') {
            const firstCard = pickStatus.firstCard;
            const secondCard = pickStatus.secondCard;
            const [a, b] = [firstCard, secondCard];
            if (a.emoji === b.emoji) {
                a.isRemoved = true;
                b.isRemoved = true;
                a.isFlipped = false;
                b.isFlipped = false;
            } else {
                a.isFlipped = false;
                b.isFlipped = false;
            }
            setPickStatus({ status: 'starting' });
            if (!cardsRemain()) {
                resetGame();
            }
            return;
        }
    }

    function handleClick(c: Card) {
        if (c.isRemoved) {
            console.log('card has been removed!');
            return;
        }
        if (pickStatus.status === 'full') {
            return;
        }

        if (c.isFlipped) {
            return;
        }

        c.isFlipped = true;

        if (pickStatus.status === 'starting') {
            setClickCount(prev => prev + 1);
            setPickStatus({ status: 'partial', card: c });
            return;
        }
        if (pickStatus.status === 'partial') {
            setClickCount(prev => prev + 1);
            const first = pickStatus.card;
            setPickStatus({ status: 'full', firstCard: first, secondCard: c });
            return;
        }
    }

    return (
        <div className="mat">
            <div className="cardset">
                {deck.map((c, ix) => (
                    <CardView card={c} key={ix} handleClick={handleClick} />
                ))}
            </div>
            <div>PickStatus: {pickStatus.status}</div>
            <div>Click count: {clickCount}</div>
            <button
                className={isEndOfPair() ? 'show' : 'hide'}
                onClick={handleAcknowledge}
            >
                acknowledge
            </button>
        </div>
    );
}
interface CardProps {
    handleClick: (c: Card) => void;
    card: Card;
}
function CardView(props: CardProps) {
    return (
        <div
            onClick={() => props.handleClick(props.card)}
            className={
                'card ' +
                (props.card.isFlipped ? 'flipped' : '') +
                ' ' +
                (props.card.isRemoved ? 'removed' : '')
            }
        >
            {!props.card.isRemoved && props.card.emoji}
        </div>
    );
}
