import {Tile} from "./tile";
import {RoomProperties} from "../room/room_property";
import {RNG} from "rot-js";
import {Glyph} from "../glyph";

const chars = [".", '.', "=", "-"];

export class RoomTile extends Tile {

    public roomProps: RoomProperties;

    constructor(roomProperties: RoomProperties) {
        super(Tile.floor.type, new Glyph(RNG.getItem(chars), Tile.floor.glyph.foregroundColor, Tile.floor.glyph.backgroundColor));
        this.roomProps = roomProperties;
    }

}