import { Reducer } from "redux";
import { ReduxStore, PlayerState, PlayerStateAction, PlayerStateActionTypes, ActorStateActionTypes } from "../types/redux";

const initialState: PlayerState = {
    playerMineralsDict: {},
    currentPlayer: undefined,
    playerList: []
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
        case PlayerStateActionTypes.SET_CURRENT_PLAYER: {
            draft.currentPlayer = action.payload;
            break;
        }
        case PlayerStateActionTypes.ADD_PLAYER:
            if (!state.playerList.some(p => p === action.payload)) {
                draft.playerList = [...draft.playerList, action.payload];
            }
            break;
        case PlayerStateActionTypes.REMOVE_PLAYER:
            draft.playerList = draft.playerList.filter(p => p != action.payload);
            break;
    }
    return draft;
};

export const setPlayerMinerals = (store: ReduxStore, playerId: string, minerals: number) =>
    store.dispatch({ type: PlayerStateActionTypes.SET_PLAYER_MINERALS, payload: { playerId, minerals }});

export const addPlayerMinerals = (store: ReduxStore, playerId: string, minerals: number) =>
    store.dispatch({ type: PlayerStateActionTypes.ADD_PLAYER_MINERALS, payload: { playerId, minerals }});

export const setCurrentPlayer = (store: ReduxStore, playerId: string) => 
    store.dispatch({ type: PlayerStateActionTypes.SET_CURRENT_PLAYER, payload: playerId });

export const addPlayer = (store: ReduxStore, playerId: string) =>
    store.dispatch({ type: PlayerStateActionTypes.ADD_PLAYER, payload: playerId });
    
export const removePlayer = (store: ReduxStore, playerId: string) => {
    store.dispatch({ type: PlayerStateActionTypes.REMOVE_PLAYER, payload: playerId });
    store.dispatch({ type: ActorStateActionTypes.REMOVE_ACTORS_FOR_PLAYER, payload: playerId });
}
