import {Game} from "../game";
import {ActorType} from "./actor";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {Bookshelf} from "../tile/bookshelf";
import {AIActor} from "./ai_actor";
import {Tile} from "../tile/tile";

export class Sending extends AIActor {

    constructor(game: Game, position: Point3D) {
        super(game, position, new Glyph("S", "#b700ff", ""));
        this.type = ActorType.Sending;
    }

    targetFilter(tile: Tile): boolean {
        return tile instanceof Bookshelf
    }
}