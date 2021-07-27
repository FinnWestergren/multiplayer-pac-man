import { ActorType } from "./actor";
import { CoordPair } from "./coordPair";

export type StampedInput = {
    timeAgo: number;
    input: Input;
};

export enum InputType {
    MOVE_UNIT = "MOVE_UNIT",
    CREATE_UNIT = "CREATE_UNIT"
};

export type Input = MoveUnit | CreateUnit;

// used for all unit types. origin information required for multiplayer sync.
type MoveUnit = { type: InputType.MOVE_UNIT, origin: CoordPair, destination: CoordPair, patrolDestination?: CoordPair, actorId: string }
type CreateUnit = { type: InputType.CREATE_UNIT, actorType: ActorType, destination: CoordPair, actorId: string }