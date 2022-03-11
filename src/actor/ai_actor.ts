import {Actor, ActorType} from "./actor";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {Path, RNG} from "rot-js";
import {Game} from "../game";
import {Tile} from "../tile/tile";
import {Point} from "../point";

export abstract class AIActor implements Actor {
    glyph: Glyph;
    type: ActorType;
    private target: Point3D;
    private path: Point[];
    private nextTargetCounter = 0;
    private notMovedCounter = 0;
    private readonly nextTargetCounterMax = 10;

    protected constructor(protected game: Game, public position: Point3D, glyph: Glyph) {
        this.glyph = glyph;
        this.type = ActorType.Clair;
    }

    abstract getName(): string;

    act(): Promise<any> {

        this.notMovedCounter++;
        if (!this.ensureTarget()) {
            return Promise.resolve();
        }
        const pathTarget = this.game.warper.findTargetThroughWarps(this, this.target);
        if (pathTarget == null) {
            return Promise.resolve();
        }

        let astar = new Path.AStar(pathTarget.x, pathTarget.y, this.game.onLevelNavigable(this.position.level, this.getUnlockPower()), {topology: 8});

        this.path = [];
        astar.compute(this.position.x, this.position.y, this.pathCallback.bind(this));
        this.path.shift(); // remove actor's position

        if (this.path.length == 1) {
            // last step
            let lastStep = this.path[0];
            let lastStep3d = new Point3D(this.position.level, lastStep.x, lastStep.y);
            if (!this.game.mapIsPassable(lastStep3d)) {
                // unreachable last step - remove
                console.log("removing last unreachable step for " + this.getName());
                this.path = [];
            }
        }

        if (this.path.length == 0) {
            // done, or target unreachable - reset actor's target
            this.target = null;
            this.nextTargetCounter = RNG.getUniformInt(this.nextTargetCounterMax / 2, this.nextTargetCounterMax);
            console.log("resetting AI actor target and waiting for " + this.nextTargetCounter + " moves");
            return Promise.resolve();
        }

        let nextStep = this.path[0];
        let nextStep3D = new Point3D(this.position.level, nextStep.x, nextStep.y);

        if (!this.game.mapIsPassable(nextStep3D)) {
            // probably doors to unlock
            this.game.interact(this, nextStep3D);
            return Promise.resolve()
        }

        if (this.game.occupiedByEnemy(nextStep3D)) {
            return Promise.resolve();
        }

        if (this.game.getPlayerPosition().equals(nextStep3D)) {
            this.playerIsStandingInWayCallback();
            return Promise.resolve();
        }

        // moving to new position
        this.position = nextStep3D;
        this.notMovedCounter = -1;

        if (this.catchPlayerCheck()) {
            this.game.catchPlayer(this);
        }

        this.game.warper.tryActorLevelWarp(this);

        return Promise.resolve();
    }


    private ensureTarget() {

        if (this.notMovedCounter > this.nextTargetCounterMax) {
            console.log(`${this.getName()} has not moved for ${this.notMovedCounter} turns - forcing target change`);
            this.target = this.game.getRandomTarget(this.targetFilter);
        }

        if (this.target == null) {
            if (this.nextTargetCounter > 0) {
                this.nextTargetCounter--;
            } else {
                this.target = this.game.getRandomTarget(this.targetFilter);
            }
        }
        return this.target != null;
    }

    private pathCallback(x: number, y: number): void {
        this.path.push(new Point(x, y));
    }

    abstract targetFilter(tile: Tile): boolean;

    abstract catchPlayerCheck(): boolean;

    abstract playerIsStandingInWayCallback();

    abstract getUnlockPower(): number;

}