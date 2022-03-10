import {Game} from "../game";
import {ActorType} from "./actor";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
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

        return tile.type == TileType.Bookshelf;
    }

    catchPlayerCheck(): boolean {

        // WIP
        let myRoom = this.game.getPositionRoom(this.position);
        if (myRoom == null) {
            return false;
        }
        if (!myRoom.danger) {
            return false;
        }
        let playerRoom = this.game.getPositionRoom(this.game.getPlayerPosition())
        // standing in the same room as a player, room marked dangerous
        return myRoom.equals(playerRoom)
    }

    playerIsStandingInWayCallback() {
        this.game.addLogMessage("Clair is giving you a stern look - you are probably standing in her way!");
    }

}