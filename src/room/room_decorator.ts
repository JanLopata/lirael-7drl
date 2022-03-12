import {Map} from "../map"
import {RoomProperties} from "./room_property";
import {LibraryDecorator} from "./library_decorator";
import {BedroomDecorator} from "./bedroom_decorator";
import {DiningRoomDecorator} from "./dining_room_decorator";
import {RNG} from "rot-js";
import {SnakeHelper} from "./snake_helper";
import {Point} from "../point";
import {TileType} from "../tile/tile";


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

        if (room.squaredSize < 15 && RoomDecorator.isSuitableForBedroom(room, map)) {
            if (this.assignType(room, RoomType.BEDROOM)) {
                room.danger = true;
                room.typicalRoomTile.refreshTilesAfterRoomPropsChange();
                return true;
            }
            return false;
        }

        if (room.squaredSize >= 35) {
            return this.assignType(room, RoomType.DINING_ROOM);
        }

        if (this.assignType(room, RoomType.LIBRARY)) {
            room.danger = RNG.getUniform() > 0.6;
            room.typicalRoomTile.refreshTilesAfterRoomPropsChange();
            return true;
        }
        return false;

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

    private static isSuitableForBedroom(room: RoomProperties, map: Map) {

        let roomSurroundings = SnakeHelper.getSnake(room.lt.plus(new Point(-1, -1)), room.rd.plus(new Point(1, 1)));
        for (let point of roomSurroundings) {
            let tile = map.getTile(point.x, point.y);
            if (tile == null)
                continue;
            if (tile.type == TileType.Floor) {
                return false;
            }
        }
        return true;

    }

}