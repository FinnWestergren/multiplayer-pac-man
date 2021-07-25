import {
    ClientMessage,
    MessageType,
    ServerMessage,
    MapResponse,
    refreshMap,
    CoordPair,
    CELLS_PER_MILLISECOND,
    getUpdateFrequency,
    handlePlayerInput,
    ActorStatus,
    Direction,
    CellModifier,
    setPlayerMinerals,
} from "core";
import {
    Store,
    writeToSinglePlayer,
    ServerStore
} from ".";
import { setLag, setSimulatedLag } from "./ducks/serverState";
import SevenByEight from "./mapFiles/7x8.json";

const smoothOverrideTriggerDist = 0.5;
const snapOverrideTriggerDist = 0.8;

export const handleMessage = (message: ClientMessage, fromPlayer: string) => {
    switch (message.type) {
        case MessageType.PING:
            const updatedMinerals = (Store.getState().playerState.playerMineralsDict[fromPlayer] ?? 0) + 100;
            setPlayerMinerals(Store, fromPlayer, updatedMinerals);
            writeToSinglePlayer({ type: MessageType.PONG }, fromPlayer);
            writeToSinglePlayer({ type: MessageType.SET_PLAYER_MINERALS, payload: {[fromPlayer]: updatedMinerals} }, fromPlayer);
            return;
        case MessageType.MAP_REQUEST:
            writeToSinglePlayer(
                {
                    type: MessageType.MAP_RESPONSE,
                    payload: getCurrentMap(),
                },
                fromPlayer
            );
            return;
        case MessageType.PLAYER_INPUT:
            const timeAgo = (ServerStore.getState().lag[fromPlayer] ?? 0) * 0.5;
            handlePlayerInput(Store, fromPlayer, {...message.payload.input, timeAgo});
            // can't use writeToAllPlayers for this message because we need to cater for everyones lag
            Store.getState().playerState.playerList.filter(pId => pId !== fromPlayer).forEach(pId => {
                const convertedMessage = { ...message };
                convertedMessage.payload.input.timeAgo = (ServerStore.getState().lag[pId] ?? 0) * 0.5 + timeAgo;
                writeToSinglePlayer(convertedMessage, pId);
            });
            return;
        case MessageType.CLIENT_PERCEPTION_UPDATE:
            const perceptionUpdate = getPerceptionUpdate(
                message.payload.locationMap,
                fromPlayer
            );
            if (perceptionUpdate) {
                writeToSinglePlayer(perceptionUpdate, fromPlayer);
            }
            return;
        case MessageType.SET_SIMULATED_LAG:
            setSimulatedLag(ServerStore, fromPlayer, message.payload);
            console.log(
                "setting simulated lag for player",
                fromPlayer,
                ServerStore.getState().simulatedLag[fromPlayer]
            );
            return;
        case MessageType.LATENCY_UPDATE:
            setLag(ServerStore, fromPlayer, message.payload);
            return;
        default:
            writeToSinglePlayer({ type: MessageType.INVALID }, fromPlayer);
    }
};

export const getCurrentMap: () => MapResponse = () => {
    if (Store.getState().mapState.mapCells.length === 0) {
        const newMap = { cells: SevenByEight.cells as Direction[][], cellModifiers: SevenByEight.modifiers as CellModifier[][] };
        refreshMap(Store, newMap);
        return newMap;
    }
    return { cells: Store.getState().mapState.mapCells, cellModifiers: Store.getState().mapState.cellModifiers };
};

const getPerceptionUpdate: (locationMap: { [actorId: string]: CoordPair }, fromPlayer: string) => ServerMessage | null = 
	(locationMap, fromPlayer) => {
    const potentialDrift = Math.abs((ServerStore.getState().lag[fromPlayer] ?? 0) * CELLS_PER_MILLISECOND * getUpdateFrequency());
    const snapOverrideSquared = Math.pow(snapOverrideTriggerDist + potentialDrift, 2);
    const smoothOverrideSquared = Math.pow(smoothOverrideTriggerDist + potentialDrift, 2);
    const smoothCorrectionMap: { [actorId: string]: CoordPair } = {};
    const snapMap: { [actorId: string]: ActorStatus } = {};
    const actorDict = Store.getState().actorState.actorDict;
    Object.keys(locationMap)
        .filter((pId) => !!actorDict[pId])
        .forEach((pId) => {
            const serverPerception = actorDict[pId].status.location;
            const clientPerception = locationMap[pId];
            const distSquared = perceptionDifferenceSquared(
                serverPerception,
                clientPerception
            );
            if (distSquared > snapOverrideSquared) {
                console.log("snapping:", fromPlayer, pId);
                snapMap[pId] = actorDict[pId].status;
            } else if (distSquared > smoothOverrideSquared) {
                const correction = interpolate(
                    serverPerception,
                    clientPerception
                );
                if (
                    clientPerception.x - correction.x >
                    clientPerception.y - correction.y
                ) {
                    smoothCorrectionMap[pId] = {
                        x: correction.x,
                        y: clientPerception.y,
                    };
                } else {
                    smoothCorrectionMap[pId] = {
                        x: clientPerception.x,
                        y: correction.y,
                    };
                }
            }
        });
    if (
        Object.keys(snapMap).length > 0 ||
        Object.keys(smoothCorrectionMap).length > 0
    ) {
        return {
            type: MessageType.STATE_CORRECTION,
            payload: { soft: smoothCorrectionMap, hard: snapMap },
        };
    }
    return null;
};

const perceptionDifferenceSquared = (
    serverPerception: CoordPair,
    clientPerception: CoordPair
) => {
    const xDiff = Math.abs(clientPerception.x - serverPerception.x);
    const yDiff = Math.abs(clientPerception.y - serverPerception.y);
    return Math.pow(xDiff, 2) + Math.pow(yDiff, 2);
};

const interpolate: (
    serverPerception: CoordPair,
    clientPerception: CoordPair
) => CoordPair = (serverPerception, clientPerception) => {
    return {
        x: (serverPerception.x + clientPerception.x) * 0.5,
        y: (serverPerception.y + clientPerception.y) * 0.5,
    };
};
