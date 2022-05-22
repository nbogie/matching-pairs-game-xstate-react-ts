// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    afterFirstCard: "clickCard";
    afterSecondCard: "clickCard";
    onPairFailure: "xstate.after(800)#PairsGameMain.GotSecondCard";
    onPairSuccess: "xstate.after(800)#PairsGameMain.GotSecondCard";
  };
  internalEvents: {
    "xstate.after(1000)#PairsGameMain.HandlePairFailure": {
      type: "xstate.after(1000)#PairsGameMain.HandlePairFailure";
    };
    "xstate.after(300)#PairsGameMain.HandlePairSuccess": {
      type: "xstate.after(300)#PairsGameMain.HandlePairSuccess";
    };
    "xstate.after(800)#PairsGameMain.GotSecondCard": {
      type: "xstate.after(800)#PairsGameMain.GotSecondCard";
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
    pairMatch: "xstate.after(800)#PairsGameMain.GotSecondCard";
    isGameOver: "xstate.after(300)#PairsGameMain.HandlePairSuccess";
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
