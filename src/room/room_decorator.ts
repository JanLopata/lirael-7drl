import {Map} from "../map"
import {RoomProperties} from "./room_property";
import {LibraryDecorator} from "./library_decorator";
import {BedroomDecorator} from "./bedroom_decorator";
import {DiningRoomDecorator} from "./dining_room_decorator";


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
        this.roomTypeLimit[RoomType.DINING_ROOM] = 2;
        this.roomTypeLimit[RoomType.BEDROOM] = 12;
        this.roomTypeLimit[RoomType.LIBRARY] = 8;
    }


    private decorateByType(map: Map, room: RoomProperties) {

        if (room.type == RoomType.LIBRARY) {
            new LibraryDecorator(map).decorate(room);
        }
        if (room.type == RoomType.BEDROOM) {
            new BedroomDecorator(map).decorate(room);
        }
        if (room.type == RoomType.DINING_ROOM) {
            new DiningRoomDecorator(map).decorate(room);
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