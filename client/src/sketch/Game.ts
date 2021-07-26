import p5 from "p5";
import { ClientStore } from "../containers/GameWrapper";
import { CoordPair, CoordPairUtils, dijkstras, Direction, junctionSelector } from "core";
import { bindHumanPlayer } from "./Controls";
import Cell from "./Cell";
import { drawActor } from "./ActorDrawer";
import { InputMode } from "../ducks/clientState";

export default class Game {
	private currentPlayer?: string;
	private selectedActorId?: string;

	private mapGraphicsContext: p5.Graphics;

	public constructor(p: p5) {
		this.mapGraphicsContext = p.createGraphics(p.width, p.height);
		this.mapGraphicsContext.pixelDensity(1);

		ClientStore.subscribe(() => {
			if (this.currentPlayer) {
				bindHumanPlayer(p, (actorId) => { this.selectedActorId = actorId }, () => this.selectedActorId);
			}
			this.drawMap();
		});

		ClientStore.subscribe(() => {
			const oldAssignment = this.currentPlayer;
			this.currentPlayer = ClientStore.getState().playerState.currentPlayer;
			if (this.currentPlayer !== oldAssignment && this.currentPlayer) {
				bindHumanPlayer(p, (actorId) => { this.selectedActorId = actorId }, () => this.selectedActorId);
			}
		});
	}
	public draw = (p: p5) => {
		p.image(this.mapGraphicsContext, 0, 0);
		let pathOrigin: CoordPair | undefined = undefined;
		const selectedActor = this.selectedActorId ? ClientStore.getState().actorState.actorDict[this.selectedActorId] : undefined;
		if (selectedActor && selectedActor.ownerId === ClientStore.getState().playerState.currentPlayer) {
			pathOrigin = selectedActor!.status.location;
		}
		const mousedOverCell = this.mousedOverCell(p);
		const withinBounds = mousedOverCell.x >= 0 && mousedOverCell.x < ClientStore.getState().mapState.mapCells[0].length
			&& mousedOverCell.y >= 0 && mousedOverCell.y < ClientStore.getState().mapState.mapCells.length;
		if (mousedOverCell && withinBounds) {
			if (ClientStore.getState().mapState.mapCells.length > 0 && pathOrigin) {
				const { totalDist, path } = dijkstras(CoordPairUtils.roundedPair(pathOrigin), mousedOverCell, junctionSelector(ClientStore.getState().mapState));
				this.drawPath(p, path, totalDist);
			}
			if (ClientStore.getState().clientState.inputMode === InputMode.PLACE_OUTPOST) {
				const center = this.centerOfMousedOver(p);
				p.fill(255);
				p.ellipse(center[0], center[1], 20);
			}
		}
		
		Object.values(ClientStore.getState().actorState.actorDict)
		.sort((a) => {
			if (a.id === this.selectedActorId) {
				return 2;
			}
			if (a.ownerId === ClientStore.getState().playerState.currentPlayer) {
				return 1;
			}
			return 0;
		})
		.forEach(actor => drawActor(p, actor, this.selectedActorId === actor.id));
	};

	private centerOfMousedOver = (p: p5) => {
		const cellSize = ClientStore.getState().mapState.cellDimensions.cellSize;
		const center = (cell: CoordPair) => [cellSize * cell.x + cellSize * 0.5, cellSize * cell.y + cellSize * 0.5]
		return center(this.mousedOverCell(p));
	}


	private drawPath = (p: p5, path: CoordPair[], totalDist: number) => {
		const textOffset = 10;
		this.makeItLookSick(p, () => {
			p.textAlign(p.CENTER);
			p.text(path.length === 0 ? 'X' : totalDist, this.centerOfMousedOver(p)[0] + textOffset, this.centerOfMousedOver(p)[1] - textOffset);
			p.beginShape();
			// @ts-ignore
			path.forEach(cell => p.vertex(...center(cell)));
			p.endShape();
		})
	}
	private mousedOverCell= (p: p5) => CoordPairUtils.flooredPair({ x: p.mouseX * ClientStore.getState().mapState.cellDimensions.oneOverCellSize, y: p.mouseY * ClientStore.getState().mapState.cellDimensions.oneOverCellSize });

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
		const mapCells = ClientStore.getState().mapState.mapCells;
		mapCells.map((row: Direction[], y: number) =>
			row.map((_column, x) => new Cell(x, y))
		).flat().forEach(c => c.draw(this.mapGraphicsContext));
	}
};
