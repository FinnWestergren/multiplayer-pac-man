import p5 from "p5";
import { Store } from "../containers/GameWrapper";
import { CoordPair, CoordPairUtils, dijkstras, Direction, junctionSelector } from "core";
import { bindHumanPlayer } from "./Controls";
import Cell from "./Cell";
import { drawActor } from "./ActorDrawer";

export default class Game {
	private currentPlayer?: string;
	private selectedActorId?: string;

	private mapGraphicsContext: p5.Graphics;

	public constructor(p: p5) {
		this.mapGraphicsContext = p.createGraphics(p.width, p.height);
		this.mapGraphicsContext.pixelDensity(1);

		Store.subscribe(() => {
			if (this.currentPlayer) {
				bindHumanPlayer(p, this.currentPlayer, (actorId) => { this.selectedActorId = actorId }, () => this.selectedActorId);
			}
			this.drawMap();
		});

		Store.subscribe(() => {
			const oldAssignment = this.currentPlayer;
			this.currentPlayer = Store.getState().playerState.currentPlayer;
			if (this.currentPlayer !== oldAssignment && this.currentPlayer) {
				bindHumanPlayer(p, this.currentPlayer, (actorId) => { this.selectedActorId = actorId }, () => this.selectedActorId);
			}
		});
	}
	public draw = (p: p5) => {
		p.image(this.mapGraphicsContext, 0, 0);
		let pathOrigin: CoordPair | undefined = undefined;
		const selectedActor = this.selectedActorId ? Store.getState().actorState.actorDict[this.selectedActorId] : undefined;
		if (selectedActor && selectedActor.ownerId === Store.getState().playerState.currentPlayer) {
			pathOrigin = selectedActor!.status.location;
		}
		if (Store.getState().mapState.mapCells.length > 0 && pathOrigin) {
			const mousedOverCell = this.mousedOverCell(p)
			const withinBounds = mousedOverCell.x >= 0 && mousedOverCell.x < Store.getState().mapState.mapCells[0].length
				&& mousedOverCell.y >= 0 && mousedOverCell.y < Store.getState().mapState.mapCells.length;
			if (mousedOverCell && withinBounds) {
				const { totalDist, path } = dijkstras(CoordPairUtils.roundedPair(pathOrigin), mousedOverCell, junctionSelector(Store.getState().mapState));
				this.drawPath(p, path, totalDist);
			}
		}
		Object.values(Store.getState().actorState.actorDict)
		.sort((a) => {
			if (a.id === this.selectedActorId) {
				return 2;
			}
			if (a.ownerId === Store.getState().playerState.currentPlayer) {
				return 1;
			}
			return 0;
		})
		.forEach(actor => drawActor(p, actor, this.selectedActorId === actor.id));
	};


	private drawPath = (p: p5, path: CoordPair[], totalDist: number) => {
		const textOffset = 10;
		const cellSize = Store.getState().mapState.cellDimensions.cellSize;
		const center = (cell: CoordPair) => [cellSize * cell.x + cellSize * 0.5, cellSize * cell.y + cellSize * 0.5]
		const centerOfMousedOver = center(this.mousedOverCell(p));
		this.makeItLookSick(p, () => {
			p.textAlign(p.CENTER);
			p.text(path.length === 0 ? 'X' : totalDist, centerOfMousedOver[0] + textOffset, centerOfMousedOver[1] - textOffset);
			p.beginShape();
			// @ts-ignore
			path.forEach(cell => p.vertex(...center(cell)));
			p.endShape();
		})
	}
	private mousedOverCell= (p: p5) => CoordPairUtils.flooredPair({ x: p.mouseX * Store.getState().mapState.cellDimensions.oneOverCellSize, y: p.mouseY * Store.getState().mapState.cellDimensions.oneOverCellSize });

	private sicknessOffset = 0;

	private makeItLookSick = (p: p5, render: () => void) => {
		if (p.frameCount % 3 === 0) {
			this.sicknessOffset = 2 * (Math.random() - 0.5)
		}
		p.push();
		p.noFill()
		p.blendMode(p.LIGHTEST)
		p.translate(this.sicknessOffset, this.sicknessOffset);
		p.stroke(255, 100, 100, 150);
		render();
		p.translate(-this.sicknessOffset, -this.sicknessOffset);
		p.stroke(0, 255, 100, 150);
		render();
		p.pop();
	}

	private drawMap = () => {
		this.mapGraphicsContext.clear();
		const mapCells = Store.getState().mapState.mapCells;
		mapCells.map((row: Direction[], y: number) =>
			row.map((_column, x) => new Cell(x, y))
		).flat().forEach(c => c.draw(this.mapGraphicsContext));
	}
};
