import {Path} from "rot-js";
import {Game} from "./game";
import {Actor, ActorType} from "./actor";
import {Point} from "./point";
import {Glyph} from "./glyph";
import {Point3D} from "./point3d";

export class Pedro implements Actor {
    glyph: Glyph;
    type: ActorType;
    private path: Point[];

    constructor(private game: Game, public position: Point3D) {
        this.glyph = new Glyph("P", "#f00", "");
        this.type = ActorType.Pedro;
    }

    act(): Promise<any> {
        let playerPosition = this.game.getPlayerPosition();
        let target = this.game.warper.findTargetThroughWarps(this, playerPosition);
        if (target == null) {
            return Promise.resolve();
        }

        let astar = new Path.AStar(target.x, target.y, this.game.onLevelPassable(this.position.level), {topology: 4});

        this.path = [];
        astar.compute(this.position.x, this.position.y, this.pathCallback.bind(this));
        this.path.shift(); // remove Pedros position

        if (this.path.length > 0) {
            if (!this.game.occupiedByEnemy(this.path[0].x, this.path[0].y)) {
                this.position = new Point3D(this.position.level, this.path[0].x, this.path[0].y);
            }
        }

        if (this.position.equals(playerPosition)) {
            this.game.catchPlayer(this);
        }

        this.game.warper.tryActorLevelWarp(this);

        return Promise.resolve();
    }

    private pathCallback(x: number, y: number): void {
        this.path.push(new Point(x, y));
    }
}