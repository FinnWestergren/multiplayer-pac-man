import { CoordPair } from "./CoordPair";

export enum InputType {
    MOVE_UNIT = "MOVE_UNIT"
}

export type Input = MoveUnit;

// used for all unit types. origin information required for multiplayer sync.
type MoveUnit = { type: InputType.MOVE_UNIT, origin: CoordPair, destination: CoordPair, actorId: string  }