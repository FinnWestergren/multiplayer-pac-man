import { ActorStateAction, MapStateAction, PlayerStateAction } from "core/static/types";
import { Reducer, Store } from "redux";
import { RootState } from "../containers/GameWrapper";

type ClientStore = Store<RootState, ClientStateAction | MapStateAction | ActorStateAction | PlayerStateAction>;

export enum ClientStateActionTypes {
    SET_INPUT_MODE
}

export enum InputMode {
    STANDARD,
    PLACE_OUTPOST
}

export type ClientState = {
    inputMode: InputMode
};


export type ClientStateAction = { type: ClientStateActionTypes.SET_INPUT_MODE; payload: InputMode };

const initialState: ClientState = {
    inputMode: InputMode.STANDARD
};

export const clientStateReducer: Reducer<ClientState, ClientStateAction> = (
    state = initialState,
    action
) => {
    const draft = { ...state };
    switch (action.type) {
        case ClientStateActionTypes.SET_INPUT_MODE:
            draft.inputMode = action.payload;
            break;
    }
    return draft;
};

export const setInputMode = (store: ClientStore, inputMode: InputMode) => store.dispatch({ type: ClientStateActionTypes.SET_INPUT_MODE, payload: inputMode })
