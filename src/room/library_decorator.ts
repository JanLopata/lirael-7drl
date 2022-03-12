import {Map} from "../map"
import {RoomProperties} from "./room_property";
import {Point} from "../point";
import {Tile} from "../tile/tile";
import {Bookshelf} from "../tile/bookshelf";

export class LibraryDecorator {

    constructor(public map: Map) {
        this.map = map;
    }

    public decorate(room: RoomProperties) {

        const size = room.rd.minus(room.lt);
        let vertical = size.x < size.y;

        if (vertical) {
            this.decorateVertical(size, room);
        } else {
            this.decorateHorizontal(size, room);
        }
    }

    private decorateHorizontal(size: Point, room: RoomProperties) {
        for (let i = 1; i < size.x; i++) {
            for (let j = 0; j < size.y + 1; j++) {
                if (j % 2 == 0) {
                    continue;
                }

                let target = new Point(i, j).plus(room.lt);
                if (this.map.getTile(target.x, target.y) == Tile.floor)
                    continue;
                if (this.doorNearby(target, room)) {
                    continue
                }
                this.map.setTile(target.x, target.y, new Bookshelf(room.danger));
            }
        }
    }

    private decorateVertical(size: Point, room: RoomProperties) {
        for (let i = 0; i < size.x + 1; i++) {
            for (let j = 1; j < size.y; j++) {
                if (i % 2 == 0) {
                    continue;
                }
                let target = new Point(i, j).plus(room.lt);
                if (this.doorNearby(target, room)) {
                    continue
                }
                this.map.setTile(target.x, target.y, new Bookshelf(room.danger));
            }
        }
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