import { Reducer } from "redux";
import { ReduxStore, PlayerState, PlayerStateAction, PlayerStateActionTypes } from "../types/redux";

const initialState: PlayerState = {
    playerMineralsDict: {}
};

export const playerStateReducer: Reducer<PlayerState, PlayerStateAction> = (state: PlayerState = initialState, action: PlayerStateAction) => {
    const draft = { ...state };
    switch (action.type) {
        case PlayerStateActionTypes.SET_PLAYER_MINERALS: {
            const playerMineralsDict = { ...draft.playerMineralsDict, [action.payload.playerId]: action.payload.minerals };
            draft.playerMineralsDict = playerMineralsDict;
            break;
        }
        case PlayerStateActionTypes.ADD_PLAYER_MINERALS: {
            const playerMinerals = draft.playerMineralsDict[action.payload.playerId];
            if (playerMinerals === undefined) {
                return draft;
            }
            const playerMineralsDict = { ...draft.playerMineralsDict, [action.payload.playerId]: (action.payload.minerals + playerMinerals) };
            draft.playerMineralsDict = playerMineralsDict;
            break;
        }
    }
    return draft;
};

export const setPlayerMinerals = (store: ReduxStore, playerId: string, minerals: number) =>
    store.dispatch({ type: PlayerStateActionTypes.SET_PLAYER_MINERALS, payload: { playerId, minerals }});

export const addPlayerMinerals = (store: ReduxStore, playerId: string, minerals: number) =>
    store.dispatch({ type: PlayerStateActionTypes.ADD_PLAYER_MINERALS, payload: { playerId, minerals }});