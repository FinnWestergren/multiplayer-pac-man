import React, { FunctionComponent } from "react";
import P5Wrapper from "./P5Wrapper";
import styled from "@emotion/styled";
import { createStore } from "redux";
import initializeSocket from "../socket";
import { runGame, ReduxStore, gameReducer } from "core";
import { Provider } from "react-redux";
import DebugLayer from "./DebugLayer";

const FlexContainer = styled.div`
    display: flex;
    justify-content: center;
`;
export const Store: ReduxStore = createStore(gameReducer)
export const ClientSocket = initializeSocket();

const GameWrapper: FunctionComponent = () => {
    runGame(Store, window.setInterval);
    return (
        <FlexContainer>
            <P5Wrapper log={console.log} />
            <Provider store={Store}>
                <DebugLayer/>
            </Provider>
        </FlexContainer>
    );
};

export default GameWrapper;
