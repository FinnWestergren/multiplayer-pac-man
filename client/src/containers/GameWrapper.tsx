import React, { FunctionComponent } from "react";
import P5Wrapper from "./P5Wrapper";
import styled from "@emotion/styled";
import { combineReducers, createStore } from "redux";
import initializeSocket from "../socket";
import { runGame,  actorStateReducer, mapStateReducer, playerStateReducer, ReduxStore } from "core";
import { Provider } from "react-redux";
import DebugLayer from "./DebugLayer";
import {  clientStateReducer } from "../ducks/clientState";

const FlexContainer = styled.div`
    display: flex;
    justify-content: center;
`;

const combined = combineReducers({ actorState: actorStateReducer, mapState: mapStateReducer, playerState: playerStateReducer, clientState: clientStateReducer })

export const ClientStore = createStore(combined);
export const CoreStore = ClientStore as ReduxStore
export const ClientSocket = initializeSocket();
export type RootState = ReturnType<typeof ClientStore.getState>

const GameWrapper: FunctionComponent = () => {
    runGame(CoreStore, window.setInterval);
    return (
        <FlexContainer>
            <P5Wrapper log={console.log} />
            <Provider store={ClientStore}>
                <DebugLayer/>
            </Provider>
        </FlexContainer>
    );
};

export default GameWrapper;
