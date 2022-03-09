import {Map} from "./map"
import {RoomProperties} from "./tile/room_property";
import {RNG} from "rot-js";
import {Point} from "./point";
import {Bookshelf} from "./tile/bookshelf";
import {LibraryDecorator} from "./library_decorator";


export enum RoomType {
    NONE,
    BEDROOM,
    LIBRARY,
    DINING_ROOM
}

export class RoomDecorator {

    private roomTypeLimit = {};
    private roomTypeCount = {};

    public decorate(room: RoomProperties, map: Map) {

        if (room.type == RoomType.NONE) {
            this.chooseAndAssignType(room, map);
        }
        if (room.type != RoomType.NONE) {
            this.decorateByType(map, room);
        }

    }

    constructor() {
        this.roomTypeLimit[RoomType.DINING_ROOM] = 1;
        this.roomTypeLimit[RoomType.BEDROOM] = 1;
        this.roomTypeLimit[RoomType.LIBRARY] = 1;
    }


    private decorateByType(map: Map, room: RoomProperties) {

        if (room.type == RoomType.LIBRARY) {
            new LibraryDecorator(map).decorate(room);
        }
    }

    private chooseAndAssignType(room: RoomProperties, map: Map): boolean {

        if (room.squaredSize < 15) {
            return this.assignType( room, RoomType.BEDROOM);
        }

        if (room.squaredSize >= 30) {
            return this.assignType( room, RoomType.DINING_ROOM);
        }

        return this.assignType( room, RoomType.LIBRARY);

    }

    private assignType(room: RoomProperties, type: RoomType): boolean {

        const newAmount = this.roomTypeCount[type] == null ? 1 : this.roomTypeCount[type] + 1;
        const limit = this.roomTypeLimit[type];
        console.log(`Trying to assign room type ${type}, newAmount=${newAmount}, limit=${limit}`)
        if (limit != null && newAmount > limit) {
            return false;
        }

        room.type = type;
        this.roomTypeCount[type] = newAmount;
        return true;
    }


}