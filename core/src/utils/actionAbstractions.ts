import { ReduxStore, StampedInput, updateActorStatus, Dictionary, CoordPair, ActorStatus, CELLS_PER_MILLISECOND } from "..";
import { addActor } from "../ducks";
import { moveActorAlongPath } from "../game/actorUpdater";
import { InputType } from "../types";

export const handlePlayerInput = (store: ReduxStore, playerId: string, stampedInput: StampedInput) => {
    switch(stampedInput.input.type) {
        case InputType.MOVE_UNIT:
            const actorStatus = store.getState().actorState.actorDict[stampedInput.input.actorId]?.status;
            if (!actorStatus) return;
            const newStatus = {...actorStatus, location: stampedInput.input.origin, destination: stampedInput.input.destination, patrolDestination: stampedInput.input.patrolDestination};
            updateActorStatus(store, stampedInput.input.actorId, newStatus);
            const distTravelled = stampedInput.timeAgo * CELLS_PER_MILLISECOND;
            console.log(`${playerId.substring(0, 4)} made a move input ${stampedInput.timeAgo}ms ago\t`, 'distance travelled since then', distTravelled);
            moveActorAlongPath(distTravelled, stampedInput.input.actorId)
            return;
        case InputType.CREATE_UNIT:
            addActor(store, playerId, stampedInput.input.actorId, stampedInput.input.actorType, stampedInput.input.destination);
            return;
    }
}

export const handleStateCorrection = (store: ReduxStore, payload: { soft: Dictionary<CoordPair>, hard: Dictionary<ActorStatus> }) => {
    const { hard, soft } = payload;
    Object.keys(store.getState().actorState.actorDict).forEach(actorId => {
        const newState = hard[actorId] ?? { ...store.getState().actorState.actorDict[actorId], location: soft[actorId] ?? store.getState().actorState.actorDict[actorId].status.location };
        updateActorStatus(store, actorId, newState);
    })
}