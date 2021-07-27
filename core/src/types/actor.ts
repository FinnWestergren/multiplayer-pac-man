import { CoordPair } from "./coordPair"
import { Direction } from "./direction"

export type Actor = {
    ownerId: string;
    type: ActorType;
    status: ActorStatus;
    id: string;
};

export type ActorStatus = {
    location: CoordPair;
    orientation: Direction;
    destination?: CoordPair;
    patrolDestination?: CoordPair; // for use with automining
};

export enum ActorType {
    CHAMPION = "CHAMPION",
    MINER = "MINER",
    OUTPOST = "OUTPOST"
};