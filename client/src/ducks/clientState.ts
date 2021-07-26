import { Reducer } from "redux";

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
