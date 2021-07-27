import { handlePlayerInput, CoordPair, InputType, Input, ActorType, generateGuid } from "core";
import { CoreStore } from "../containers/GameWrapper";
import { sendPlayerInput } from "../socket/clientExtensions";

export const moveUnit = (actorId: string, destination: CoordPair, patrolDestination?: CoordPair) => {
	const playerId = CoreStore.getState().playerState.currentPlayer;
	const origin = CoreStore.getState().actorState.actorDict[actorId]?.status.location;
	if (!origin || !playerId) return; // probably should do some error reporting or something someday
	if (!CoreStore.getState().actorState.actorOwnershipDict[playerId].includes(actorId)) return;
	
	const input: Input = {
		type: InputType.MOVE_UNIT, 
		destination, 
		origin,
		actorId,
		patrolDestination
	};

	const stampedInput = {
		timeAgo: 0,
		input
	};

	handlePlayerInput(CoreStore, playerId!, stampedInput);
	sendPlayerInput(playerId!, stampedInput);
}

export const createUnit = (destination: CoordPair, actorType: ActorType) => {
	const playerId = CoreStore.getState().playerState.currentPlayer;
	if (!playerId) return; // probably should do some error reporting or something someday

	const actorId = generateGuid();

	const input: Input = {
		type: InputType.CREATE_UNIT, 
		destination, 
		actorId,
		actorType
	};

	const stampedInput = {
		timeAgo: 0,
		input
	};

	handlePlayerInput(CoreStore, playerId!, stampedInput);
	sendPlayerInput(playerId!, stampedInput);
}