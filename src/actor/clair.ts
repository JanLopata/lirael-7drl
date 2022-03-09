import {Path, RNG} from "rot-js";
import {Game} from "../game";
import {Actor, ActorType} from "./actor";
import {Point} from "../point";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {Bookshelf} from "../tile/bookshelf";
import {Tile, TileType} from "../tile/tile";

export class Clair implements Actor {
    glyph: Glyph;
    type: ActorType;
    private target: Point3D;
    private path: Point[];
    private unlockStrength = 2;
    private nextTargetCounter = 0;
    private notMovedCounter = 0;
    private readonly nextTargetCounterMax = 10;

    constructor(private game: Game, public position: Point3D) {
        this.glyph = new Glyph("C", "#d6dbff", "");
        this.type = ActorType.Clair;
    }

    act(): Promise<any> {

        this.notMovedCounter++;
        if (!this.ensureTarget()) {
            return Promise.resolve();
        }
        const pathTarget = this.game.warper.findTargetThroughWarps(this, this.target);
        if (pathTarget == null) {
            return Promise.resolve();
        }

        let astar = new Path.AStar(pathTarget.x, pathTarget.y, this.game.onLevelNavigable(this.position.level, this.unlockStrength), {topology: 8});

        this.path = [];
        astar.compute(this.position.x, this.position.y, this.pathCallback.bind(this));
        this.path.shift(); // remove actor's position

        if (this.path.length == 0) {
            // done, or target unreachable - reset sending target
            this.target = null;
            this.nextTargetCounter = RNG.getUniformInt(this.nextTargetCounterMax / 2, this.nextTargetCounterMax);
            console.log("resetting clair's target and waiting for " + this.nextTargetCounter + " moves");
            return Promise.resolve();
        }

        let nextStep = this.path[0];
        let nextStep3D = new Point3D(this.position.level, nextStep.x, nextStep.y);

        if (!this.game.mapIsPassable(this.position.level, nextStep.x, nextStep.y)) {
            // probably doors to unlock
            this.game.interact(this, nextStep3D);
            return Promise.resolve()
        }

        if (!this.game.occupiedByEnemy(nextStep.x, nextStep.y)) {
            this.position = nextStep3D;
            this.notMovedCounter = -1;
        }

        this.game.warper.tryActorLevelWarp(this);

        return Promise.resolve();
    }

    private ensureTarget() {

        if (this.notMovedCounter > this.nextTargetCounterMax) {
            console.log(`Clair has not moved for ${this.notMovedCounter} turns - forcing target change`);
            this.target = this.game.getRandomTarget(this.clairTargetFilter);
        }

        if (this.target == null) {
            if (this.nextTargetCounter > 0) {
                this.nextTargetCounter--;
            } else {
                this.target = this.game.getRandomTarget(this.clairTargetFilter);
            }
        }
        return this.target != null;
    }

    clairTargetFilter(tile: Tile): boolean {
        if (tile.type == TileType.Bed)
            return true;
        if (tile.type == TileType.Chair)
            return true;

        return tile instanceof Bookshelf;
    }

    private pathCallback(x: number, y: number): void {
        this.path.push(new Point(x, y));
    }
}