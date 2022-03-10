import {Game} from "../game";
import {ActorType} from "./actor";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {AIActor} from "./ai_actor";
import {Tile, TileType} from "../tile/tile";
import {RNG} from "rot-js";

const sendingNames = ['Snarky', 'Old timey', 'Magixi', 'Randy', 'Rumbly', 'Pebble', 'Norman']

export class Sending extends AIActor {

    name: string;

    constructor(game: Game, position: Point3D) {
        super(game, position, new Glyph("S", "#b700ff", ""));
        this.type = ActorType.Sending;
        this.name = RNG.getItem(sendingNames);
    }

    targetFilter(tile: Tile): boolean {
        return tile.type == TileType.Bookshelf;
    }

    catchPlayerCheck(): boolean {
        return false;
    }

    playerIsStandingInWayCallback() {
        // nothing
    }

}