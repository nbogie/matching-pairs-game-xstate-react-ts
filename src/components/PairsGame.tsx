import React, { useState } from 'react';
import { Card, CardView } from './Card';
import { makeEmojisDeck } from './Deck';
import { useMachine } from '@xstate/react';
import { inspect } from '@xstate/inspect';
import { createMachine, assign } from "xstate";

export interface PairsGameContext {
    clickCount: number;
    firstCard: Card | null;
    secondCard: Card | null;
    allCards: Card[]
}
type PairEvents =
    | { type: "advance" }
    | { type: "clickCard", card: Card }
    | { type: "startGame" };

inspect({ iframe: false });
const pairsMachine =
    createMachine({
        schema: { context: {} as PairsGameContext, events: {} as PairEvents },
        id: "PairsGameMain",
        initial: "AwaitStart",
        tsTypes: {} as import("./PairsGame.typegen").Typegen0,
        states: {
            AwaitStart: {
                entry: assign({
                    clickCount: 0,
                    firstCard: null,
                    secondCard: null,
                    allCards: []
                }),
                on: {
                    startGame: {
                        target: "WaitFirstCard",
                    },
                },
            },
            WaitFirstCard: {
                entry: assign({
                    clickCount: (ctx: PairsGameContext, event) => ctx.clickCount + 1,
                }),
                on: {
                    clickCard: {
                        target: "WaitSecondCard",
                    },
                },
            },
            WaitSecondCard: {
                entry: "afterFirstCard",
                on: {
                    clickCard: {
                        target: "GotSecondCard",
                    },
                },
            },
            GotSecondCard: {
                entry: "afterSecondCard",
                after: {
                    800: [
                        {
                            target: "HandlePairSuccess",
                            cond: "pairMatch"
                        },
                        { target: "HandlePairFailure" }
                    ]
                },
            },
            HandlePairFailure: {
                entry: "onPairFailure",
                after: {
                    1000: {
                        target: "WaitFirstCard",
                    }
                }
            },
            HandlePairSuccess: {
                entry: "onPairSuccess",
                after: {
                    300: [
                        {
                            target: "GameOverAndReview",
                            cond: "isGameOver"
                        }, {
                            target: "WaitFirstCard",
                        },
                    ]
                }
            },
            GameOverAndReview: {
                on: {
                    advance: {
                        target: "AwaitStart",
                    },
                },
            },
        },
    },
        {
            guards: {
                pairMatch: (ctx, event) => ctx.firstCard?.emoji === ctx.secondCard?.emoji,
                isGameOver: (ctx, event) => ctx.allCards.every(c => c.isRemoved)
            },
            actions: {
                onPairSuccess: assign((ctx, event) => {
                    if (ctx.firstCard && ctx.secondCard) {
                        ctx.firstCard.isRemoved = true;
                        ctx.secondCard.isRemoved = true;
                    }
                    return { firstCard: null, secondCard: null }
                }),
                onPairFailure: assign((ctx, event) => {
                    if (ctx.firstCard && ctx.secondCard) {
                        ctx.firstCard.isFaceUp = false;
                        ctx.secondCard.isFaceUp = false;
                    }
                    return { firstCard: null, secondCard: null }
                }),
                afterFirstCard: assign({
                    clickCount: (ctx, event) => ctx.clickCount + 1,
                    firstCard: (ctx, event) => {
                        event.card.isFaceUp = true
                        return event.card
                    }
                })
                , afterSecondCard: assign({
                    clickCount: (ctx, event) => ctx.clickCount + 1,
                    secondCard: (ctx, event) => {
                        event.card.isFaceUp = true
                        return event.card
                    }
                })
            }
        });


type TurnStatus =
    | { title: 'noneTurned' }
    | { title: 'oneTurned'; firstCard: Card }
    | { title: 'twoTurned'; firstCard: Card; secondCard: Card };

export default function PairsGame() {
    const [current, send] = useMachine(pairsMachine, { devTools: true });
    // const active = current.matches("active");

    const { clickCount } = current.context;
    const stateName = current.value;

    const [turnStatus, setTurnStatus] = useState<TurnStatus>({
        title: 'noneTurned'
    });

    const [deck, setDeck] = useState<Card[]>(makeEmojisDeck());
    // const rPressed= useKeyPress("r", handleKeyDown);



    function resetGame() {
        // setClickCount(0);
        setDeck(makeEmojisDeck());
        setTurnStatus({ title: 'noneTurned' });
    }

    function cardsRemain() {
        return deck.filter(c => !c.isRemoved).length > 0;
    }


    // function handleKeyDown() {
    //     // Stale closure - this function definition is passed around and has closure over the var environment of a previous invocation of the PairsGame component function execution,
    //     // with old values for turnStatus.
    //     console.log('handleKeyDown in PairsGame', { turnStatus })
    //     if (turnStatus.title === 'twoTurned') {
    //         console.log('yes two are face up')
    //         handleClickWhenTwoCardsFaceUp()
    //     }
    // }

    function handleClickWhenTwoCardsFaceUp() {

        if (turnStatus.title === 'twoTurned') {
            const { firstCard: a, secondCard: b } = turnStatus;
            if (a.emoji === b.emoji) {
                //TODO: don't mutate card states
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

    function handleClickOnMat() {
        if (turnStatus.title === 'twoTurned') {
            handleClickWhenTwoCardsFaceUp();
            return;
        }
    }

    function handleClickCard(c: Card) {
        if (turnStatus.title === 'twoTurned') {
            handleClickWhenTwoCardsFaceUp();
            return;
        }

        if (c.isRemoved) {
            console.error('Clicked card which has been removed!');
            return;
        }

        if (c.isFaceUp) {
            return;
        }

        c.isFaceUp = true;

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
        <div className="mat" onClick={handleClickOnMat}>
            <div className="cardset">
                {deck.map((c, ix) => (
                    <CardView card={c} key={ix} handleClickCard={
                        () => {
                            console.log("clicked card: ", c)
                            send({ type: "clickCard", card: c });
                        }
                    } />
                ))}
            </div>
            {stateName === "AwaitStart" && <button onClick={() => send("startGame")} >Start game</button>}
            <div>Game State: {current.value}</div>
            <div>First Card: {current.context.firstCard?.emoji}</div>
            <div>Second Card: {current.context.secondCard?.emoji}</div>
            <div>Click count: {clickCount}</div>
            {true && <pre>{JSON.stringify(current, null, 2)}</pre>}

        </div>
    );
}
