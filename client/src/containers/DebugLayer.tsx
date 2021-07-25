import React, { FunctionComponent, useState } from "react";
import { sendSimulatedLagInput } from "../socket/clientExtensions";
import { getUpdateFrequency, ReduxState } from "core";
import Slider from "../debugComponents/DebugSlider";
import ControllerGrid from "../debugComponents/ControllerGrid";
import DebugIndicator from "../debugComponents/DebugIndicator";
import { connect } from "react-redux";


type Props = {
    currentPlayerMinerals: number
}

const getCurrentUPS = () => Math.floor(getUpdateFrequency() * 1000);

const DebugLayer: FunctionComponent<Props> = ({currentPlayerMinerals}) => {
    const [currentUPS, setCurrentUPS] = useState(getCurrentUPS());
    window.setInterval(() => setCurrentUPS(getCurrentUPS()), 1000)
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
        </ControllerGrid>
    );
};

const mapStateToProps = (state: ReduxState) => {
    const currentPlayer = state.actorState.currentPlayer;
    return {
        currentPlayerMinerals: currentPlayer ? state.playerState.playerMineralsDict[currentPlayer] : 0
    }
}

export default connect(mapStateToProps)(DebugLayer);
