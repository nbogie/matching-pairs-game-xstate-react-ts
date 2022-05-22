// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    setupGame: "xstate.after(2000)#PairsGameMain.GameOverAndReview";
    afterFirstCard: "clickCard";
    afterSecondCard: "clickCard";
    onPairFailure: "xstate.after(400)#PairsGameMain.GotSecondCard";
    onPairSuccess: "xstate.after(400)#PairsGameMain.GotSecondCard";
  };
  internalEvents: {
    "xstate.after(2000)#PairsGameMain.GameOverAndReview": {
      type: "xstate.after(2000)#PairsGameMain.GameOverAndReview";
    };
    "xstate.after(400)#PairsGameMain.GotSecondCard": {
      type: "xstate.after(400)#PairsGameMain.GotSecondCard";
    };
    "xstate.after(1)#PairsGameMain.HandlePairSuccess": {
      type: "xstate.after(1)#PairsGameMain.HandlePairSuccess";
    };
    "xstate.after(1000)#PairsGameMain.AwaitStart": {
      type: "xstate.after(1000)#PairsGameMain.AwaitStart";
    };
    "xstate.after(100)#PairsGameMain.HandlePairFailure": {
      type: "xstate.after(100)#PairsGameMain.HandlePairFailure";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    isDifferentCard: "clickCard";
    pairMatch: "xstate.after(400)#PairsGameMain.GotSecondCard";
    isGameOver: "xstate.after(1)#PairsGameMain.HandlePairSuccess";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "AwaitStart"
    | "WaitFirstCard"
    | "WaitSecondCard"
    | "GotSecondCard"
    | "HandlePairFailure"
    | "HandlePairSuccess"
    | "GameOverAndReview";
  tags: never;
}
