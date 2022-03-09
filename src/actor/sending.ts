import {Path} from "rot-js";
import {Game} from "../game";
import {Actor, ActorType} from "./actor";
import {Point} from "../point";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {Bookshelf} from "../tile/bookshelf";

export class Sending implements Actor {
    glyph: Glyph;
    type: ActorType;
    private target: Point3D;
    private path: Point[];
    private unlockStrength = 2;

    constructor(private game: Game, public position: Point3D) {
        this.glyph = new Glyph("S", "#b700ff", "");
        this.type = ActorType.Sending;
    }

    act(): Promise<any> {

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
            console.log("reseting sending target");
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
        }

        this.game.warper.tryActorLevelWarp(this);

        return Promise.resolve();
    }

    private ensureTarget() {

        if (this.target == null) {
            this.target = this.game.getRandomTarget(tile => tile instanceof Bookshelf);
        }
        return this.target != null;
    }

    private pathCallback(x: number, y: number): void {
        this.path.push(new Point(x, y));
    }
}