import {Map} from "./map"
import {RoomProperties} from "./tile/room_property";
import {RNG} from "rot-js";
import {Point} from "./point";
import {Bookshelf} from "./tile/bookshelf";


export enum RoomType {
    NONE,
    BEDROOM,
    LIBRARY,
    DINING_ROOM
}

export class RoomDecorator {

    constructor(public map: Map) {
        this.map = map;
    }

    public decorate(room: RoomProperties) {

        if (room.type == RoomType.NONE) {
            this.assignType(room, this.map);
        }
        if (room.type != RoomType.NONE) {
            this.decorateByType(this.map, room);
        }

    }

    private decorateByType(map: Map, room: RoomProperties) {

        if (room.type == RoomType.LIBRARY) {
            this.decorateLibrary(map, room);


        }
    }

    private decorateLibrary(map: Map, room: RoomProperties) {
        let vertical = RNG.getUniform() > 0.5;
        let shift = 0; // RNG.getUniformInt(0, 1);
        const size = room.rd.minus(room.lt);
        if (vertical) {
            for (let i = 0; i < size.x + 1; i++) {
                for (let j = 1; j < size.y; j++) {
                    if ((shift + i) % 2 == 0) {
                        continue;
                    }
                    let target = new Point(i, j).plus(room.lt);
                    if (this.doorNearby(target, room)) {
                        continue
                    }
                    map.setTile(target.x, target.y, new Bookshelf());
                }
            }
        }
    }

    private doorNearby(point: Point, room: RoomProperties): boolean {
        for (let door of room.doors) {
            if (door.dist4(point) <= 1)
                return true;
        }
        return false;
    }

    private assignType(room: RoomProperties, map: Map) {

        if (room.squaredSize < 15) {
            room.type = RoomType.BEDROOM;
            return
        }

        if (room.squaredSize >= 30) {
            room.type = RoomType.DINING_ROOM;
        }

        room.type = RoomType.LIBRARY;

    }


}