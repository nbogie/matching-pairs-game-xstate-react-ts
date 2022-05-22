import React from 'react';
import { Card, CardView } from './Card';
import { makeEmojisDeck } from './Deck';
import { useMachine } from '@xstate/react';
import { inspect } from '@xstate/inspect';
import { createMachine, assign } from "xstate";

export interface PairsGameContext {
    firstCard: Card | null;
    secondCard: Card | null;
    allCards: Card[],
}
type PairEvents =
    | { type: "clickCard", card: Card }
    | { type: "cheat" };

inspect({ iframe: false });
const pairsMachine =
    createMachine({
        schema: { context: {} as PairsGameContext, events: {} as PairEvents },
        id: "PairsGameMain",
        initial: "AwaitStart",
        tsTypes: {} as import("./PairsGame.typegen").Typegen0,
        states: {
            AwaitStart: {
                entry: "setupGame",
                after: {
                    1000:
                        { target: "WaitFirstCard" }
                },
            },
            WaitFirstCard: {
                entry: assign({}),
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
                        cond: "isDifferentCard",
                        target: "GotSecondCard",
                    },
                },
            },
            GotSecondCard: {
                entry: "afterSecondCard",
                after: {
                    400: [
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
                    100: {
                        target: "WaitFirstCard",
                    }
                }
            },
            HandlePairSuccess: {
                entry: "onPairSuccess",
                after: {
                    1: [
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
                entry: "redisplayCardsAtGameOver",
                after: {
                    2000: {
                        target: "AwaitStart"
                    }
                },
            },
        },
    },
        {
            guards: {
                pairMatch: (ctx, event) => ctx.firstCard?.emoji === ctx.secondCard?.emoji,
                isGameOver: (ctx, event) => ctx.allCards.every(c => c.isRemoved),
                isDifferentCard: (ctx, event) => ctx.firstCard ? (ctx.firstCard.id !== event.card.id) : false
            },
            actions: {
                setupGame: assign(() => ({
                    firstCard: null,
                    secondCard: null,
                    allCards: makeEmojisDeck(),
                })),
                onPairSuccess: assign((ctx, event) => {
                    //TODO: can't we have TS know that first and second card are
                    // non-null from the action that gets us here?
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
                    firstCard: (ctx, event) => {
                        event.card.isFaceUp = true
                        return event.card
                    }
                })
                , afterSecondCard: assign({
                    secondCard: (ctx, event) => {
                        event.card.isFaceUp = true
                        return event.card
                    }
                })
                , redisplayCardsAtGameOver: assign((ctx, event) => {
                    ctx.allCards.forEach(c => {
                        c.isFaceUp = true
                        c.isRemoved = false
                    })
                    const newAllCards = [...ctx.allCards]
                    return {
                        firstCard: null,
                        secondCard: null,
                        allCards: newAllCards
                    }
                })
            }
        });


export default function PairsGame() {
    const [current, send] = useMachine(pairsMachine, { devTools: true });

    const { allCards } = current.context;
    const stateName = current.value;

    return (
        <div className="mat" onClick={() => { }}>
            <div className="cardset">
                {allCards.map((c, ix) => (
                    <CardView card={c} key={ix} handleClickCard={
                        () => {
                            send({ type: "clickCard", card: c });
                        }
                    } />
                ))}
            </div>
            {stateName === "GameOverAndReview" && <h2>Game Over!</h2>}
            <div>Game State: {current.value}</div>
            {false && <pre>{JSON.stringify(current, null, 2)}</pre>}

        </div>
    );
}
