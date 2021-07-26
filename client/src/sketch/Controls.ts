import p5 from "p5";
import { CoordPair, CoordPairUtils } from "core";
import { ClientStore } from "../containers/GameWrapper";
import { moveUnit } from "../utils/clientActions";
import { InputMode } from "../ducks/clientState";

export const bindHumanPlayer = (p: p5, selectActor: (actorId?: string) => void, getSelectedActorId: () => string | undefined) => {
    const oneOverCellSize = 1 / ClientStore.getState().mapState.cellDimensions.cellSize;
    const cells = ClientStore.getState().mapState.mapCells;
    if (!cells || cells.length === 0) {
        return;
    }
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

    window.oncontextmenu = (e: MouseEvent) => {
        mouseClicked(e);
        return false;
    }

    p.mouseClicked = (e: MouseEvent) => mouseClicked(e);
    
    const mouseClicked = (e: MouseEvent) => { 
        const mouse = {x: e.clientX, y: e.clientY} // can't use p.mouse because of scrolling / changing screen sizes
        const actorId = getSelectedActorId();
        const clickedTile = getClickedTile(mouse);
        if (!clickedTile) {
            switch(ClientStore.getState().clientState.inputMode) {
                case InputMode.PLACE_OUTPOST:
                    tryPlaceOutpost();
                case InputMode.STANDARD:
                default:
                    selectActor();
                    return;
            }
            
        }
        if (e.button === 2 && actorId) {
            moveUnit(actorId, clickedTile);
        }
        else {
            selectActor(checkForActorInCell(clickedTile)?.id);
        }
    }
        
};

const checkForActorInCell = (tile: CoordPair) => {
    const actors = Object.values(ClientStore.getState().actorState.actorDict)
    .filter(a => CoordPairUtils.equalPairs(tile, CoordPairUtils.snappedPair(a.status.location)));
    if (actors.length === 0) return;
    const ownedActors = actors.filter(a => a.ownerId === ClientStore.getState().playerState.currentPlayer);
    return ownedActors[0] ?? actors[0];
}
