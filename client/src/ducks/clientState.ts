import { ActorStateAction, ActorType, MapStateAction, PlayerStateAction } from "core/static/types";
import { Reducer, Store } from "redux";
import { RootState } from "../containers/GameWrapper";

type ClientStore = Store<RootState, ClientStateAction | MapStateAction | ActorStateAction | PlayerStateAction>;

export enum ClientStateActionTypes {
    SET_INPUT_MODE
}

export enum InputMode {
    STANDARD,
    PLACE_UNIT
}

export type ClientState = {
    inputMode: InputMode;
    placementUnitType?: ActorType;
};


export type ClientStateAction = 
    { type: ClientStateActionTypes.SET_INPUT_MODE; payload: { inputMode: InputMode, unitType?: ActorType } };

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
            draft.inputMode = action.payload.inputMode;
            if (action.payload.inputMode === InputMode.PLACE_UNIT) {
                draft.placementUnitType = action.payload.unitType
            }
            break;
    }
    return draft;
};

export const setInputMode = (store: ClientStore, inputMode: InputMode, unitType?: ActorType) =>  
    store.dispatch({ type: ClientStateActionTypes.SET_INPUT_MODE, payload: { inputMode, unitType } });
