import React, { FunctionComponent, useState } from "react";
import { sendSimulatedLagInput } from "../socket/clientExtensions";
import { ActorType, getUpdateFrequency } from "core";
import Slider from "../debugComponents/DebugSlider";
import ControllerGrid from "../debugComponents/ControllerGrid";
import DebugIndicator from "../debugComponents/DebugIndicator";
import DebugButton from "../debugComponents/DebugButton";
import { connect } from "react-redux";
import { InputMode } from "../ducks/clientState";
import { ClientStateActionTypes } from "../ducks/clientState";
import { RootState } from "./GameWrapper";


type StateProps = {
    currentPlayerMinerals: number;
}

type DispatchProps = {
    setPlaceUnitMode: (actorType: ActorType | null) => void;
}

const getCurrentUPS = () => Math.floor(getUpdateFrequency() * 1000);

const DebugLayer: FunctionComponent<StateProps & DispatchProps> = ({currentPlayerMinerals, setPlaceUnitMode}) => {
    const [currentUPS, setCurrentUPS] = useState(getCurrentUPS());
    window.setInterval(() => setCurrentUPS(getCurrentUPS()), 1000);
    return (
        <ControllerGrid>
            <Slider
                min={0}
                max={100}
                value={0}
                onChange={sendSimulatedLagInput}
                sliderId="sim-lag-input"
                label="simulated lag (ms)" />
            <DebugIndicator
                label='Player Minerals'
                value={currentPlayerMinerals} />
            <DebugIndicator
                label='UPS'
                value={currentUPS} />
            <DebugButton
                label='Create Outpost'
                onClick={() => setPlaceUnitMode(ActorType.OUTPOST)} />
        </ControllerGrid>
    );
};

const mapStateToProps = (state: RootState) => ({
    currentPlayerMinerals: state.playerState.currentPlayer ? state.playerState.playerMineralsDict[state.playerState.currentPlayer] : 0
})

const mapDispatchToProps = {
    setPlaceUnitMode: (actorType: ActorType | null) => ({ type: ClientStateActionTypes.SET_INPUT_MODE, payload: actorType === ActorType.OUTPOST ? InputMode.PLACE_OUTPOST : InputMode.STANDARD })
}

export default connect(mapStateToProps, mapDispatchToProps)(DebugLayer);
