import { handlePlayerInput, CoordPair, InputType, Input, ActorType, generateGuid } from "core";
import { Store } from "../containers/GameWrapper";
import { sendPlayerInput } from "../socket/clientExtensions";

export const moveUnit = (actorId: string, destination: CoordPair) => {
	const playerId = Store.getState().playerState.currentPlayer;
	const origin = Store.getState().actorState.actorDict[actorId]?.status.location;
	if (!origin || !playerId) return; // probably should do some error reporting or something someday
	if (!Store.getState().actorState.actorOwnershipDict[playerId].includes(actorId)) return;
	
	const input: Input = {
		type: InputType.MOVE_UNIT, 
		destination, 
		origin,
		actorId
	};

	const stampedInput = {
		timeAgo: 0,
		input
	};

	handlePlayerInput(Store, playerId!, stampedInput);
	sendPlayerInput(playerId!, stampedInput);
}

export const createUnit = (destination: CoordPair, actorType: ActorType) => {
	const playerId = Store.getState().playerState.currentPlayer;
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

	handlePlayerInput(Store, playerId!, stampedInput);
	sendPlayerInput(playerId!, stampedInput);
}