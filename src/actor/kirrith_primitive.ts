import {Path} from "rot-js";
import {Game} from "../game";
import {Actor, ActorType} from "./actor";
import {Point} from "../point";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";

export class KirrithPrimitive implements Actor {
    glyph: Glyph;
    type: ActorType;
    private path: Point[];

    constructor(private game: Game, public position: Point3D) {
        this.glyph = new Glyph("K", "#f00", "");
        this.type = ActorType.Kirrith;
    }

    act(): Promise<any> {
        let playerPosition = this.game.getPlayerPosition();
        let target = this.game.warper.findTargetThroughWarps(this, playerPosition);
        if (target == null) {
            return Promise.resolve();
        }
        console.log(this.position);

        let astar = new Path.AStar(target.x, target.y, this.game.onLevelNavigable(this.position.level, 1), {topology: 8});

        this.path = [];
        if (this.game.statusLine.turns == this.game.statusLine.turnsMax) {
            // warn the player
            this.game.addLogMessage(`You should go to your bed, %c{${this.glyph.foregroundColor}}${this.getName()}%c{} must not catch you!`);
        }
        if (this.game.statusLine.turns >= this.game.statusLine.turnsMax) {
            // activate Kirrith when time's up
            astar.compute(this.position.x, this.position.y, this.pathCallback.bind(this));
        }

        this.path.shift(); // remove actor position
        if (this.path.length > 0) {
            let nextStep = this.path[0];
            let nextStep3D = new Point3D(this.position.level, nextStep.x, nextStep.y);

            if (!this.game.mapIsPassable(nextStep3D)) {
                // probably doors to unlock
                this.game.interact(this, nextStep3D);
                return Promise.resolve()
            }

            if (!this.game.occupiedByEnemy(nextStep3D)) {
                this.position = nextStep3D;
            }
        }

        if (this.catchPlayerCheck()) {
            this.game.catchPlayer(this);
        }


        this.game.warper.tryActorLevelWarp(this);

        return Promise.resolve();
    }

    private pathCallback(x: number, y: number): void {
        this.path.push(new Point(x, y));
    }

    catchPlayerCheck(): boolean {
        let playerPosition = this.game.getPlayerPosition();
        if (playerPosition.equals(this.position))
            return true;

        let myRoom = this.game.getPositionRoom(this.position);
        if (myRoom == null) {
            return false;
        }
        if (!myRoom.danger) {
            return false;
        }
        let playerRoom = this.game.getPositionRoom(playerPosition)
        // standing in the same room as a player, room marked dangerous
        return myRoom.equals(playerRoom)
    }

    getName(): string {
        return "Aunt Kirrith";
    }

    getUnlockPower(): number {
        return 2;
    }

}