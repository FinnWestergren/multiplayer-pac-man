import { combineReducers } from "redux";
import { actorStateReducer } from "./actorState";
import { mapStateReducer } from "./mapState";
import { playerStateReducer } from "./playerState";

export * from "./mapState";
export * from "./actorState";
export * from "./playerState";


const combined = combineReducers({
    actorState: actorStateReducer,
    mapState: mapStateReducer,
    playerState: playerStateReducer
});

export default combined;
