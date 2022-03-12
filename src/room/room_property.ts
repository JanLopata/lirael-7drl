import {Actor} from "../actor/actor";
import {Room} from "rot-js/lib/map/features";
import {Point} from "../point";
import {RoomType} from "./room_decorator";
import {v4 as uuid} from 'uuid';
import {RoomTile} from "../tile/room_tile";

export class RoomProperties {

    private id: string = uuid();
    public occupant: Actor;
    public type: RoomType;
    public danger: boolean;
    public squaredSize: number;
    public open: boolean; // WIP
    public lt: Point;
    public rd: Point;
    public doors: Point[] = [];
    public typicalRoomTile: RoomTile = null;

    constructor(room: Room, public level: number, public shift: Point, ) {
        this.occupant = null;
        this.type = RoomType.NONE;
        this.danger = false;
        this.lt = new Point(room.getLeft(), room.getTop()).plus(shift);
        this.rd = new Point(room.getRight(), room.getBottom()).plus(shift);
        this.squaredSize = Math.abs(this.rd.x - this.lt.x) * Math.abs(this.rd.y - this.lt.y);
        this.shift = shift;
        this.level = level;
        this.open = true;
        room.getDoors(this.doorsCallback.bind(this));
    }

    private doorsCallback(x: number, y: number): void {
        this.doors.push(new Point(x, y).plus(this.shift));
    }

    equals(other: RoomProperties) {
        return other != null && other.id == this.id;
    }
}