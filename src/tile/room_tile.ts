import {Tile} from "./tile";
import {RoomProperties} from "../room/room_property";
import {RNG} from "rot-js";
import {Glyph} from "../glyph";

const chars = [".", '.', "=", "-"];
export const dangerColor = "#ac3232";

function getDangerColor(roomProps: RoomProperties, originalColor: string): string {
    if (roomProps.danger) {
        return dangerColor;
    } else {
        return originalColor;

    }
}

export class RoomTile extends Tile {

    public roomProps: RoomProperties;

    constructor(roomProperties: RoomProperties) {
        super(Tile.floor.type, new Glyph(RNG.getItem(chars), getDangerColor(roomProperties, Tile.floor.glyph.foregroundColor)), true);
        this.roomProps = roomProperties;
    }

}