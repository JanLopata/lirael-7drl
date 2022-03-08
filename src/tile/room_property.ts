import {Actor} from "../actor";
import {Room} from "rot-js/lib/map/features";

enum RoomType {
    NONE,
    BEDROOM,
    LIBRARY,
    DINING_ROOM
}

export class RoomProperties {

    public occupant: Actor;
    public type: RoomType;
    public danger: boolean;

    constructor(public room: Room) {
        this.occupant = null;
        this.type = RoomType.NONE;
        this.danger = false;
    }

}