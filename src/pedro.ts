import {Path} from "rot-js";
import {Game} from "./game";
import {Actor, ActorType} from "./actor";
import {Point} from "./point";
import {Glyph} from "./glyph";
import {Point3D} from "./point3d";
import {Tile} from "./tile";

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
        let target: Point;
        if (playerPosition.level == this.position.level) {
            target = playerPosition.toPoint();
        } else {
            // wander hopelessly
            while (target == null) {
                // while = hack
                target = this.game.sameLevelPointOrNull(this.position.level, this.game.getRandomTilePositions(Tile.floor.type)[0]);
            }
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

        return Promise.resolve();
    }

    private pathCallback(x: number, y: number): void {
        this.path.push(new Point(x, y));
    }
}