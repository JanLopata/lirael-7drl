import {Actor} from "../actor";
import {Room} from "rot-js/lib/map/features";
import {Point} from "../point";
import {RoomType} from "../room_decorator";


export class RoomProperties {

    public occupant: Actor;
    public type: RoomType;
    public danger: boolean;
    public squaredSize: number;
    public open: boolean; // WIP
    public lt: Point;
    public rd: Point;
    public doors: Point[] = [];

    constructor(room: Room, public shift: Point) {
        this.occupant = null;
        this.type = RoomType.NONE;
        this.danger = false;
        this.lt = new Point(room.getLeft(), room.getTop()).plus(shift);
        this.rd = new Point(room.getRight(), room.getBottom()).plus(shift);
        this.squaredSize = Math.abs(this.rd.x - this.lt.x) * Math.abs(this.rd.y - this.lt.y);
        this.shift = shift;
        this.open = true;
        room.getDoors(this.doorsCallback.bind(this));
    }

    private doorsCallback(x: number, y: number): void {
        this.doors.push(new Point(x, y).plus(this.shift));
    }

}