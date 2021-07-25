import { Store } from "redux";
import { CoordPair } from "./coordPair";
import { Direction } from "./direction";
import { Actor, ActorStatus as ActorStatus, ActorType } from "./actor";
import { Dictionary } from ".";
import { CellModifier } from "./cellModifier";
import { MapResponse } from "../socketObject";

export type MapStore = Store<MapState, MapStateAction>;
export type ActorStore = Store<ActorState, ActorStateAction>;
export type PlayerStore = Store<PlayerState, PlayerStateAction>;
export type ReduxStore = Store<ReduxState, MapStateAction | ActorStateAction | PlayerStateAction>;

export type ReduxState = {
    actorState: ActorState,
    mapState: MapState,
    playerState: PlayerState
}

/* #region MapTypes  */
export type MapState = {
    mapCells: Direction[][];
    appDimensions: AppDimensions;
    cellDimensions: CellDimensions;
    cellModifiers: CellModifier[][];
}

export enum MapStateActionTypes {
    REFRESH_MAP = "REFRESH_MAP",
    UPDATE_APP_DIMENSIONS = "UPDATE_APP_DIMENSIONS",
    UPDATE_CELL_DIMENSIONS = "UPDATE_CELL_DIMENSIONS"
}

export type AppDimensions = {
    canvasHeight: number;
    canvasWidth: number;
}

export type CellDimensions = {
    cellSize: number;
    oneOverCellSize: number;
}

export type MapStateAction =
    { type: MapStateActionTypes.REFRESH_MAP; payload: MapResponse } |
    { type: MapStateActionTypes.UPDATE_APP_DIMENSIONS; payload: AppDimensions } |
    { type: MapStateActionTypes.UPDATE_CELL_DIMENSIONS; payload: CellDimensions }
/* #endregion MapTypes  */
/* #region ActorTypes  */

export type ActorState = {
    currentPlayer?: string; // should move this to playerState
    actorPathDict: Dictionary<CoordPair[]>;
    actorDict: Dictionary<Actor>;
    actorOwnershipDict: Dictionary<string[]>;
    playerList: string[];  // should move this to playerState
};

export enum ActorStateActionTypes {
    SET_ACTOR_STATUS = "SET_ACTOR_STATUS",
    ADD_PLAYER = "ADD_PLAYER",
    ADD_ACTOR = "ADD_ACTOR",
    REMOVE_PLAYER = "REMOVE_PLAYER",
    REMOVE_ACTOR = "REMOVE_ACTOR",
    SET_GAME_STATE = "SET_GAME_STATE"
};

export type ActorStateAction =
    { type: ActorStateActionTypes.SET_ACTOR_STATUS; payload: { actorId: string, status: ActorStatus } } |
    { type: ActorStateActionTypes.ADD_PLAYER; payload: string } |
    { type: ActorStateActionTypes.REMOVE_PLAYER; payload: string } |
    { type: ActorStateActionTypes.ADD_ACTOR; payload: { ownerId: string, actorId: string, actorType: ActorType, location: CoordPair } } |
    { type: ActorStateActionTypes.REMOVE_ACTOR; payload: string } |
    { type: ActorStateActionTypes.SET_GAME_STATE; payload: ActorState }
/* #endregion ActorTypes  */
/* #region PlayerTypes  */
    export type PlayerState = {
        playerMineralsDict: Dictionary<number>
    }

    export enum PlayerStateActionTypes {
        SET_PLAYER_MINERALS = "SET_PLAYER_MINERALS",
        ADD_PLAYER_MINERALS = "ADD_PLAYER_MINERALS"
    };
    
    export type PlayerStateAction =
        { type: PlayerStateActionTypes.SET_PLAYER_MINERALS; payload: { playerId: string, minerals: number } } |
        { type: PlayerStateActionTypes.ADD_PLAYER_MINERALS; payload: { playerId: string, minerals: number } } 
/* #endregion PlayerTypes  */