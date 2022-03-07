import { Path } from "rot-js";
import { Game } from "./game";
import { Actor, ActorType } from "./actor";
import { Point } from "./point";
import { Glyph } from "./glyph";
import { Tile } from "./tile";
import {Point3D} from "./point3d";

export class TinyPedro implements Actor {
    glyph: Glyph;
    type: ActorType;
    private target: Point;
    private path: Point[];

    constructor(private game: Game, public position: Point3D) {
        this.glyph = new Glyph("p", "#00f", "");
        this.type = ActorType.TinyPedro;
    }

    act(): Promise<any> {
        let playerPosition = this.game.getPlayerPosition();
        if (this.position.equals(playerPosition)) {
            this.game.catchPlayer(this);
        }

        if (!this.target) {
            this.target = this.game.sameLevelPointOrNull(this.position.level, this.game.getRandomTilePositions(Tile.box.type)[0]);
        }
        let astar = new Path.AStar(this.target.x, this.target.y, this.game.onLevelPassable(this.position.level).bind(this.game), { topology: 8 });

        this.path = [];
        astar.compute(this.position.x, this.position.y, this.pathCallback.bind(this));
        this.path.shift(); // remove tiny Pedros position

        if (this.path.length > 0) {
            if (!this.game.occupiedByEnemy(this.path[0].x, this.path[0].y)) {
                this.position = new Point3D(this.position.level, this.path[0].x, this.path[0].y);
            }
        }

        if (this.position.equals(playerPosition)) {
            this.game.catchPlayer(this);
        } else if (this.position.toPoint().equals(this.target)) {
            this.game.destroyBox(this, this.position.level, this.position.x, this.position.y);
            this.target = undefined;
        }

        return Promise.resolve();
    }

    private pathCallback(x: number, y: number): void {
        this.path.push(new Point(x, y));
    }
}