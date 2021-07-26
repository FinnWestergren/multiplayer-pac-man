import { Reducer } from "redux";
import { CoordPair, Direction } from "../types";
import { ActorState, ActorStateActionTypes, ActorStateAction, ReduxStore } from "../types/redux";
import { ActorStatus, ActorType } from "../types/actor";

const initialState: ActorState = {
    actorDict: {},
    actorPathDict: {},
    actorOwnershipDict: {}
};

export const actorStateReducer: Reducer<ActorState, ActorStateAction> = (state: ActorState = initialState, action: ActorStateAction) => {
    const draft = { ...state };
    switch (action.type) {
        case ActorStateActionTypes.SET_ACTOR_STATE:
            return action.payload;
        case ActorStateActionTypes.SET_ACTOR_STATUS:
            draft.actorDict[action.payload.actorId].status = action.payload.status;
            break;
        case ActorStateActionTypes.ADD_ACTOR:
            draft.actorDict[action.payload.actorId] = { 
                type: action.payload.actorType,
                ownerId: action.payload.ownerId,
                status: { location: action.payload.location, orientation: Direction.NONE },
                id: action.payload.actorId
            };
            if (draft.actorOwnershipDict[action.payload.ownerId]) {
                draft.actorOwnershipDict[action.payload.ownerId].push(action.payload.actorId);
            }
            else {
                draft.actorOwnershipDict[action.payload.ownerId] = [action.payload.actorId];
            }
            break;
        case ActorStateActionTypes.REMOVE_ACTOR:
            const obj = draft.actorDict[action.payload];
            draft.actorOwnershipDict[obj.ownerId] = draft.actorOwnershipDict[obj.ownerId].filter(o => o != action.payload); 
            break;
        case ActorStateActionTypes.REMOVE_ACTORS_FOR_PLAYER:
            draft.actorOwnershipDict[action.payload]?.forEach(oId => {
                delete draft.actorDict[oId];
            });
            delete draft.actorOwnershipDict[action.payload];
            break;
    }
    return draft;
};

export const setActorState = (store: ReduxStore, state: ActorState) => 
    store.dispatch({ type: ActorStateActionTypes.SET_ACTOR_STATE, payload: state });

export const updateActorStatus = (store: ReduxStore, actorId: string, newStatus: ActorStatus) => 
    store.dispatch({ type: ActorStateActionTypes.SET_ACTOR_STATUS, payload: { actorId, status: newStatus } });

export const addActor = (store: ReduxStore, ownerId: string, actorId: string, actorType: ActorType, location: CoordPair) => 
    store.dispatch({ type: ActorStateActionTypes.ADD_ACTOR, payload: { ownerId, actorType, location, actorId }});

export const removePlayerActors = (store: ReduxStore, playerId: string) => 
    store.dispatch({ type: ActorStateActionTypes.REMOVE_ACTORS_FOR_PLAYER, payload: playerId });
