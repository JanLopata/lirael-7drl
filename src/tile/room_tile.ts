import {Tile} from "./tile";
import {RoomProperties} from "./room_property";

export class RoomTile extends Tile {

    public roomProps: RoomProperties;

    constructor(roomProperties: RoomProperties) {
        super(Tile.floor.type, Tile.floor.glyph);
        this.roomProps = roomProperties;
    }

}