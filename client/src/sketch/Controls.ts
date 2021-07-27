import p5 from "p5";
import { ActorType, CellModifier, CoordPair, CoordPairUtils, dijkstras, junctionSelector } from "core";
import { ClientStore } from "../containers/GameWrapper";
import { createUnit, moveUnit } from "../utils/clientActions";
import { InputMode, setInputMode } from "../ducks/clientState";

export const bindHumanPlayer = (p: p5, selectActor: (actorId: string | null) => void, getSelectedActorId: () => string | null) => {
    const oneOverCellSize = 1 / ClientStore.getState().mapState.cellDimensions.cellSize;
    const cells = ClientStore.getState().mapState.mapCells;
    if (!cells || cells.length === 0) return;
    const max_y = cells.length, max_x = cells[0].length;

    const getClickedTile = (mouse: CoordPair) => {
        const element = document.getElementById("app-p5_container");
        if (!element) {
            return;
        }
        const xDest = Math.floor((mouse.x - element.offsetLeft + document.documentElement.scrollLeft) * oneOverCellSize);
        const yDest = Math.floor((mouse.y - element.offsetTop + document.documentElement.scrollTop) * oneOverCellSize);
        if (xDest >= 0 && yDest >= 0 && xDest < max_x && yDest < max_y) {
            return {x: xDest, y: yDest};
        }
    }

    // right click = left click
    window.oncontextmenu = (e: MouseEvent) => {
        rightClick(e);
        return false;
    }

    p.mouseClicked = (e: MouseEvent) => leftClick(e);
    
    const leftClick = (e: MouseEvent) => { 
        const mouse = {x: e.clientX, y: e.clientY} // can't use p.mouse because of scrolling / changing screen sizes
        const actorId = getSelectedActorId();
        const clickedTile = getClickedTile(mouse);
        if (!clickedTile) {
            switch(ClientStore.getState().clientState.inputMode) {
                case InputMode.STANDARD:
                default:
                    selectActor(null);
                    return;
            }
            
        }
        switch(ClientStore.getState().clientState.inputMode) {
            case InputMode.PLACE_UNIT:
                const placementUnitType = ClientStore.getState().clientState.placementUnitType;
                if (placementUnitType) {
                    createUnit(clickedTile, placementUnitType);
                }
                setInputMode(ClientStore, InputMode.STANDARD);
                break;
            case InputMode.STANDARD:
            selectActor(checkForActorInCell(clickedTile)?.id ?? null);
        }
    }

    const rightClick = (e: MouseEvent) => {
        const mouse = {x: e.clientX, y: e.clientY} // can't use p.mouse because of scrolling / changing screen sizes
        const selectedActorId = getSelectedActorId();
        if (selectedActorId) {
            const selectedActor = ClientStore.getState().actorState.actorDict[selectedActorId];
            const clickedTile = getClickedTile(mouse);
            if (clickedTile) {
                const clickedTileType = ClientStore.getState().mapState.cellModifiers[clickedTile.y][clickedTile.x]
                if (selectedActor.ownerId === ClientStore.getState().playerState.currentPlayer) {
                    if (selectedActor.type === ActorType.MINER && clickedTileType === CellModifier.MINE) {
                        const nearestOutpost = findNearestOwnedOutpost(clickedTile);
                        if (nearestOutpost) {
                            moveUnit(selectedActorId, clickedTile, nearestOutpost);
                            return;
                        }
                    }
                    if (isMovable(selectedActorId)) {
                        moveUnit(selectedActorId, clickedTile);
                    }
                }
            }
        }
    }
};

// this will probably evolve over time to something bigger like a "has property" lookup system.
const isMovable = (actorId: string) => {
    return ClientStore.getState().actorState.actorDict[actorId].type !== ActorType.OUTPOST;
}

const checkForActorInCell = (tile: CoordPair) => {
    const actors = Object.values(ClientStore.getState().actorState.actorDict)
    .filter(a => CoordPairUtils.equalPairs(tile, CoordPairUtils.snappedPair(a.status.location)));
    if (actors.length === 0) return;
    const ownedActors = actors.filter(a => a.ownerId === ClientStore.getState().playerState.currentPlayer);
    return ownedActors[0] ?? actors[0];
}

const findNearestOwnedOutpost = (tile: CoordPair) => {
    const distCalc = (dest: CoordPair) => dijkstras(tile, dest, junctionSelector(ClientStore.getState().mapState)).totalDist;
    const outpostList = 
        Object.values(ClientStore.getState().actorState.actorDict)
        .filter(a => a.ownerId === ClientStore.getState().playerState.currentPlayer && a.type === ActorType.OUTPOST)
        .sort((a,b) => distCalc(b.status.location) - distCalc(a.status.location));
    return outpostList.length > 0 ? outpostList[0].status.location : null;
}