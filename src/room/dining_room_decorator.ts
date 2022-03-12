import {Map} from "../map"
import {RoomProperties} from "./room_property";
import {Point} from "../point";
import {Tile} from "../tile/tile";

export class DiningRoomDecorator {

    constructor(public map: Map) {
        this.map = map;
    }

    public decorate(room: RoomProperties) {

        const size = room.rd.minus(room.lt);

        for (let i = 1; i < size.x; i++) {
            for (let j = 1; j < size.y; j++) {

                let tile = DiningRoomDecorator.getDecorationTile(i, j);
                if (tile == null) {
                    continue;
                }

                let target = new Point(i, j).plus(room.lt);
                if (this.map.getTile(target.x, target.y) == Tile.floor)
                    continue;

                if (this.doorNearby(target, room)) {
                    continue;
                }
                this.map.setTile(target.x, target.y, tile);
            }
        }
    }

    private static getDecorationTile(i: number, j: number): Tile {
        if (i % 4 == 3 || j % 4 == 0) {
            return null;
        }
        if (i % 4 == 1) {
            return Tile.table;
        }

        return Tile.chair;

    }

    private doorNearby(point: Point, room: RoomProperties): boolean {
        for (let door of room.doors) {
            if (door.dist4(point) <= 1) {
                return true;
            }
        }
        return false;
    }


}