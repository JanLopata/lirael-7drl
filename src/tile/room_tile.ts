import {Tile} from "./tile";
import {RoomProperties} from "../room/room_property";
import {Glyph} from "../glyph";
import {RoomType} from "../room/room_decorator";

export const dangerColor = "#ac3232";

function getDangerColor(roomProps: RoomProperties, originalColor: string): string {
    if (roomProps.danger) {
        return dangerColor;
    } else {
        return originalColor;

    }
}

function getGlyphChar(roomProps: RoomProperties): string {

    const {type} = roomProps;
    if (type == RoomType.BEDROOM) {
        return "-";
    }
    if (type == RoomType.LIBRARY) {
        return "=";
    }
    if (type == RoomType.DINING_ROOM) {
        return "=";
    }
    return ".";
}

export class RoomTile extends Tile {

    public roomProps: RoomProperties;

    constructor(roomProperties: RoomProperties) {
        super(Tile.floor.type, new Glyph(getGlyphChar(roomProperties)), true);
        this.roomProps = roomProperties;
        this.refreshTilesAfterRoomPropsChange();
    }

    refreshTilesAfterRoomPropsChange() {
        this.glyph.foregroundColor = getDangerColor(this.roomProps, Tile.floor.glyph.foregroundColor);
        this.glyph.character = getGlyphChar(this.roomProps);
    }

}