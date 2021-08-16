import { CoordPair, CoordPairUtils } from "..";
import { store } from "../game";
import { tieAllNodes, MapNode } from "../map/mapProcessing";
import { Direction } from "../types";
import PriorityQueue from "./PriorityQueue";

type WeightedNode = MapNode & { weight: number; }

export const dijkstras: (startCell: CoordPair, endCell: CoordPair, junctions: (MapNode | null)[][]) => {totalDist: number, path: CoordPair[]} = (startCell, endCell, junctions) => {
    if (CoordPairUtils.equalPairs(startCell, endCell)) {
        // gotta return the end cell because the start cell might be rounded, meaning that the actor might 
        // not have reached the center of the tile yet
        return {totalDist: 0, path: [endCell]} 
    }
    const startNode: MapNode = { ...startCell, neighbors:[] };
    tieAllNodes(startNode, junctions, store.getState().mapState.mapCells[startCell.y][startCell.x]);
    const queue = new PriorityQueue<WeightedNode>((a, b) => a.weight < b.weight);
    queue.push({ ...startNode, weight: 0 });
    const visitedTable: { totalDist: number, parentNode: WeightedNode | null }[][] = store.getState().mapState.mapCells.map(row => row.map(() => { return { totalDist: Number.POSITIVE_INFINITY, parentNode: null }} ));
    visitedTable[startCell.y][startCell.x].totalDist = 0;

    const checkForEndNode = (currentNode: MapNode, neighbor: MapNode) => {
        if (currentNode.x === neighbor.x && endCell.x === currentNode.x) {
            return (endCell.y > currentNode.y && endCell.y < neighbor.y) || (endCell.y < currentNode.y && endCell.y > neighbor.y)
        }

        if (currentNode.y === neighbor.y && endCell.y === currentNode.y) {
            return (endCell.x > currentNode.x && endCell.x < neighbor.x) || (endCell.x < currentNode.x && endCell.x > neighbor.x)
        }
    }

    while (queue.size() > 0) {
        const currentNode = queue.pop();
        const neighbors = currentNode.neighbors.filter(n => n) as MapNode[];
        const weightedNeighbors: WeightedNode[] = neighbors.map(neighbor => {
            const weight = currentNode.weight + CoordPairUtils.distDirect(neighbor, currentNode);
            return { ...neighbor, weight } ;
        })
        .filter(n => n && (visitedTable[n.y][n.x].totalDist > n.weight));

        weightedNeighbors.forEach(n => visitedTable[n.y][n.x] = { totalDist: n.weight, parentNode: currentNode });

        // end condition
        if (weightedNeighbors.some(n => checkForEndNode(currentNode, n))) {
            const dist = CoordPairUtils.distDirect(endCell, currentNode);
            // pick the node with the smaller weight and set current node
            if (visitedTable[endCell.y][endCell.x].totalDist > currentNode.weight + dist) {
                visitedTable[endCell.y][endCell.x].totalDist = currentNode.weight + dist;
                visitedTable[endCell.y][endCell.x].parentNode = currentNode;
            }
        }

        queue.push(...weightedNeighbors.sort((a, b) => CoordPairUtils.getDirection(currentNode, a) - CoordPairUtils.getDirection(currentNode, b)));
    }

    // we reverse the list at the end
    let output = [endCell];
    while (!CoordPairUtils.equalPairs(output[output.length - 1], startCell)) {
        const currentCell = output[output.length - 1];
        const parent = visitedTable[currentCell.y][currentCell.x].parentNode;
        if (!parent) {
            return {totalDist : -1, path: []};
        }
        output = [...output, { x: parent.x, y: parent.y }]; // here we have to explicitly pass only the values we want to avoid circular references.
    }
    const totalDist = visitedTable[endCell.y][endCell.x].totalDist;
    return {totalDist, path: output.reverse()};
}
