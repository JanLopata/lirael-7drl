import {Map} from "./map"
import {RoomProperties} from "./tile/room_property";
import {RNG} from "rot-js";
import {Point} from "./point";
import {Bookshelf} from "./tile/bookshelf";

export class LibraryDecorator {

    constructor(public map: Map) {
        this.map = map;
    }

    public decorate(room: RoomProperties) {

        let horizontal = RNG.getUniform() > 0.5;
        console.log(`decorating library with lt=${room.lt} rd=${room.rd}, horizontal=${horizontal}`)
        const size = room.rd.minus(room.lt);

        if (horizontal) {
            for (let i = 0; i < size.x + 1; i++) {
                for (let j = 1; j < size.y; j++) {
                    if (i % 2 == 0) {
                        continue;
                    }
                    let target = new Point(i, j).plus(room.lt);
                    if (this.doorNearby(target, room)) {
                        continue
                    }
                    this.map.setTile(target.x, target.y, new Bookshelf());
                }
            }
        }

    }

    private doorNearby(point: Point, room: RoomProperties): boolean {
        for (let door of room.doors) {
            if (door.dist4(point) <= 1) {
                console.log(`doors are nearby ${point}`);
                return true;
            }
        }
        return false;
    }


}