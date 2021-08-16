import { CoordPair } from "../types";
import { Direction, DirectionUtils } from "../types/direction";

export const preProcessMap = (cells: Direction[][]) => {
    const [height, width] = [cells.length, cells[0].length];
    const nodesSoFar: (MapNode | null)[][] = [];
    for (let y = 0; y < height; y++) {
        nodesSoFar.push([]);
        for (let x = 0; x < width; x++) {
            const cell = cells[y][x];
            if (!DirectionUtils.isAJunction(cell)) {
                nodesSoFar[y].push(null)
                continue;
            }
            const newNode = { x, y, neighbors: [] };
            if (DirectionUtils.isLeft(cell)) {
                TieNeighbor(newNode, findLeftNode(x, y, nodesSoFar), Direction.LEFT);
            }
            if (DirectionUtils.isUp(cell)) {
                TieNeighbor(newNode, findUpNode(x, y, nodesSoFar), Direction.UP);
            }
            nodesSoFar[y].push(newNode);
        }
    }
    return nodesSoFar;
};

export type MapNode = CoordPair & {
    neighbors: (MapNode | null)[];
}

export const tieAllNodes = (node: MapNode, nodeMap: (MapNode | null)[][], cell: Direction, bothWays: boolean = false) => {
    if (DirectionUtils.isLeft(cell)) {
        TieNeighbor(node, findLeftNode(node.x, node.y, nodeMap), Direction.LEFT, bothWays);
    }
    if (DirectionUtils.isUp(cell)) {
        TieNeighbor(node, findUpNode(node.x, node.y, nodeMap), Direction.UP, bothWays);
    }
    if (DirectionUtils.isDown(cell)) {
        TieNeighbor(node, findDownNode(node.x, node.y, nodeMap), Direction.DOWN, bothWays);
    }
    if (DirectionUtils.isRight(cell)) {
        TieNeighbor(node, findRightNode(node.x, node.y, nodeMap), Direction.RIGHT, bothWays);
    }
}


const findLeftNode = (x: number, y: number, nodeMap: (MapNode | null)[][]) => {
    for (let i = x - 1; i >= 0; i--) {
        if (nodeMap[y][i] !== null) return nodeMap[y][i];
    }
    return null;
}

const findUpNode = (x: number, y: number, nodeMap: (MapNode | null)[][]) => {
    for (let i = y - 1; i >= 0; i--) {
        if (nodeMap[i][x] !== null) return nodeMap[i][x];
    }
    return null;
}

const findDownNode = (x: number, y: number, nodeMap: (MapNode | null)[][]) => {
    for (let i = y + 1; i < nodeMap.length; i++) {
        if (nodeMap[i][x] !== null) return nodeMap[i][x];
    }
    return null;
}

const findRightNode = (x: number, y: number, nodeMap: (MapNode | null)[][]) => {
    for (let i = x + 1; i < nodeMap[y].length; i++) {
        if (nodeMap[y][i] !== null) return nodeMap[y][i];
    }
    return null;
}

const TieNeighbor = (node: MapNode, otherNode: MapNode | null, dir: Direction, bothWays: boolean = true) => {
    switch (dir) {
        case Direction.UP:
            node.neighbors[0] = otherNode;
            break;
        case Direction.RIGHT:
            node.neighbors[1] = otherNode;
            break;
        case Direction.DOWN:
            node.neighbors[2] = otherNode;
            break;
        case Direction.LEFT:
            node.neighbors[3] = otherNode;
            break;
        default:
            console.warn('MapNode.TieNeighbor recieved invalid direction', DirectionUtils.getString(dir))
            return;
    }
    if (otherNode !== null && bothWays) {
        TieNeighbor(otherNode, node, DirectionUtils.getOpposite(dir), false);
    }
}
