import {Game} from "../game";
import {ActorType} from "./actor";
import {Glyph} from "../glyph";
import {Point3D} from "../point3d";
import {Tile, TileType} from "../tile/tile";
import {AIActor} from "./ai_actor";

export class Clair extends AIActor {
    name: string;

    constructor(game: Game, position: Point3D, name: string, public unlockPower: number) {
        super(game, position, new Glyph("C", "#d6dbff", ""));
        this.type = ActorType.Clair;
        this.name = name;
        this.unlockPower = unlockPower;
    }

    getName(): string {
        return this.name;
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
        this.game.addLogMessage(`%c{${this.glyph.foregroundColor}}${this.name}%c{} is giving you a stern look - you are standing in her way!`);
    }

    getUnlockPower(): number {
        return this.unlockPower;
    }

}