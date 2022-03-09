import {Game} from "../game";
import {ActorType} from "./actor";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {Bookshelf} from "../tile/bookshelf";
import {Tile, TileType} from "../tile/tile";
import {AIActor} from "./ai_actor";

export class Clair extends AIActor {

    constructor(game: Game, position: Point3D) {
        super(game, position, new Glyph("C", "#d6dbff", ""));
        this.type = ActorType.Clair;
    }

    targetFilter(tile: Tile): boolean {
        if (tile.type == TileType.Bed)
            return true;
        if (tile.type == TileType.Chair)
            return true;

        return tile instanceof Bookshelf;
    }

}