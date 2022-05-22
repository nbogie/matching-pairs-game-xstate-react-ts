import React from 'react';
import { Card, CardView } from './Card';
import { makeEmojisDeck } from './Deck';
import { useMachine } from '@xstate/react';
import { inspect } from '@xstate/inspect';
import { createMachine, assign } from "xstate";

export interface PairsGameContext {
    turnStatus: TurnStatus,
    allCards: Card[],
}
type PairEvents =
    | { type: "clickCard", card: Card }
    | { type: "cheat" };

type TurnStatus =
    | { title: 'noneTurned' }
    | { title: 'oneTurned'; firstCard: Card }
    | { title: 'twoTurned'; firstCard: Card; secondCard: Card };


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
                pairMatch: (ctx, event) => ctx.turnStatus.title === "twoTurned" && ctx.turnStatus.firstCard.emoji === ctx.turnStatus.secondCard.emoji,
                isGameOver: (ctx, event) => ctx.allCards.every(c => c.isRemoved),
                isDifferentCard: (ctx, event) => ctx.turnStatus.title === "oneTurned" && ctx.turnStatus.firstCard.id !== event.card.id
            },
            actions: {
                setupGame: assign(() => ({
                    turnStatus: { title: "noneTurned" },
                    allCards: makeEmojisDeck(),
                })),
                onPairSuccess: assign((ctx, event) => {
                    //TODO: can't we have TS know that first and second card are
                    // non-null from the action that gets us here?
                    if (ctx.turnStatus.title === "twoTurned") {
                        ctx.turnStatus.firstCard.isRemoved = true;
                        ctx.turnStatus.secondCard.isRemoved = true;
                    }
                    return {
                        turnStatus: { title: "noneTurned" } as TurnStatus
                    }
                }),
                onPairFailure: assign((ctx, event) => {
                    if (ctx.turnStatus.title === "twoTurned") {
                        ctx.turnStatus.firstCard.isFaceUp = false;
                        ctx.turnStatus.secondCard.isFaceUp = false;
                    }
                    return { turnStatus: { title: "noneTurned" } as TurnStatus }
                }),
                afterFirstCard: assign({
                    turnStatus: (ctx, event) => {
                        event.card.isFaceUp = true
                        const thing: TurnStatus = {
                            title: "oneTurned",
                            firstCard: event.card
                        }
                        return thing
                    }
                })
                , afterSecondCard: assign({
                    turnStatus: (ctx, event) => {
                        event.card.isFaceUp = true
                        if (ctx.turnStatus.title === "oneTurned") {
                            const thing: TurnStatus = {
                                title: "twoTurned",
                                firstCard: ctx.turnStatus.firstCard,
                                secondCard: event.card
                            }
                            return thing
                        } else {
                            return ctx.turnStatus
                        }
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
