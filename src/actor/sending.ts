import {Game} from "../game";
import {ActorType} from "./actor";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {AIActor} from "./ai_actor";
import {Tile, TileType} from "../tile/tile";

export class Sending extends AIActor {

    name: string;

    constructor(game: Game, position: Point3D, name: string) {
        super(game, position, new Glyph("S", "#b700ff", ""));
        this.type = ActorType.Sending;
        this.name = name;
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

    getName(): string {
        return this.name;
    }

    getUnlockPower(): number {
        return 2;
    }

}