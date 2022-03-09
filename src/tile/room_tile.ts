import {Tile} from "./tile";
import {RoomProperties} from "../room/room_property";
import {RNG} from "rot-js";
import {Glyph} from "../glyph";

export class RoomTile extends Tile {

    public roomProps: RoomProperties;

    constructor(roomProperties: RoomProperties) {
        super(Tile.floor.type, new Glyph("." , Tile.floor.glyph.foregroundColor, Tile.floor.glyph.backgroundColor));
        this.glyph.character = RNG.getItem([",", "a", "s", "d", "f", "g", "h", "i"]) ;
        this.roomProps = roomProperties;
    }

}