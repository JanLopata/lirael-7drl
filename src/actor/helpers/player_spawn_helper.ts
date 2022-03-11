import {Game} from "../../game";
import {Point3D} from "../../point3d";
import {Tile} from "../../tile/tile";
import {RoomTile} from "../../tile/room_tile";
import {Player} from "../player";

export class PlayerSpawnHelper {

    game: Game;
    spawnPoint: Point3D;

    constructor(game: Game) {
        this.game = game;

        this.spawnPoint = game.getRandomTarget(this.tileFilter)

    }

    private tileFilter(tile: Tile): boolean {
        if (tile instanceof RoomTile) {
            return tile.roomProps.occupant != null && tile.roomProps.occupant instanceof Player;
        }
    }

    getPlayerSpawnPoint(): Point3D {
        return this.spawnPoint;
    }


}