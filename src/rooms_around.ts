import {Map} from "./map"
import {Tile, TileType} from "./tile/tile";
import {SpiralPart} from "./spiral_part";
import Digger from "rot-js/lib/map/digger";
import {Point} from "./point";
import {Door} from "./tile/door";
import {RoomTile} from "./tile/room_tile";
import {RoomProperties} from "./room/room_property";
import {RoomDecorator, RoomType} from "./room/room_decorator";
import {Actor} from "./actor/actor";
import {Player} from "./actor/player";

const roomDebug = false;

export class RoomsAround {

    private readonly generatedTiles: { [key: string]: Tile };
    private readonly doorsList: Point[];
    private readonly roomsWithProperty: RoomProperties[];

    private readonly level: number;

    private readonly spiralPart: SpiralPart;
    private readonly outsideDiameter: number;
    private readonly width: number;
    private readonly height: number;
    private readonly shift: Point;
    private readonly decorator: RoomDecorator;
    private digger: Digger;

    constructor(level: number, spiralPart: SpiralPart, outsideDiameter: number, decorator: RoomDecorator) {
        this.level = level;
        this.spiralPart = spiralPart;
        this.doorsList = [];
        this.roomsWithProperty = [];
        this.generatedTiles = {};
        this.decorator = decorator;
        if (roomDebug) {
            this.width = 20;
            this.height = 20;
            this.shift = new Point(100, 100);
        } else {
            this.outsideDiameter = outsideDiameter;
            this.width = Math.round(1.7 * outsideDiameter);
            this.height = 2 * this.outsideDiameter;
            const shiftX = spiralPart.orientedLeft ? -this.width : 0;
            this.shift = new Point(shiftX, -this.outsideDiameter);
        }

        this.generate();

    }

    generate(): void {
        let digger = new Digger(this.width, this.height,
            {"dugPercentage": 0.6, "corridorLength": [1, 4], "roomHeight": [3, 9], "roomWidth": [3, 9]})
        digger.create(this.diggerCallback.bind(this));

        for (let room of digger.getRooms()) {
            const x = this.shift.x + room.getCenter()[0];
            const y = this.shift.y + room.getCenter()[1]
            console.log("level " + this.level + " room: " + x + "," + y);
            room.getDoors(this.doorsCallback.bind(this));
        }
        console.log("created rooms: " + digger.getRooms().length)
        this.digger = digger;
    }

    public imprintToMap(map: Map) {

        for (let room of this.digger.getRooms()) {
            let props = new RoomProperties(room, this.level, this.shift);
            let roomTile = new RoomTile(props);
            props.typicalRoomTile = roomTile;
            this.roomsWithProperty.push(props);
            for (let i = room._x1; i <= room._x2; i++) {
                for (let j = room._y1; j <= room._y2; j++) {
                    if (map.getTile(this.shift.x + i, this.shift.y + j) == null)
                        map.setTile(i + this.shift.x, j + this.shift.y, roomTile);
                }
            }
        }

        for (let generatedTilesKey in this.generatedTiles) {
            let point = this.keyToPoint(generatedTilesKey).plus(this.shift);
            if (map.getTile(point.x, point.y) == null) {
                map.setTile(point.x, point.y, Tile.floor);
            }
        }

        for (let doorPoint of this.doorsList) {
            const point = doorPoint.plus(this.shift);
            console.log("adding doors to level " + this.level + ' ' + point)

            if (map.getTileType(point.x, point.y) == TileType.Floor) {
                map.setTile(point.x, point.y, new Door(1));
            }
        }

        for (let room of this.roomsWithProperty) {
            this.decorator.decorate(room, map);
        }
    }

    assignBedrooms(actorList: Actor[]) {

        for (let room of this.roomsWithProperty) {
            if (actorList.length == 0)
                return;
            if (room.type != RoomType.BEDROOM || room.occupant != null)
                continue;
            room.occupant = actorList.pop();
            if (room.occupant instanceof Player) {
                // remove danger
                room.danger = false;
                room.typicalRoomTile.refreshTilesAfterRoomPropsChange();
            }
        }
    }

    private coordinatesToKey(x: number, y: number): string {
        return x + "," + y;
    }

    private keyToPoint(key: string): Point {
        let parts = key.split(",");
        return new Point(parseInt(parts[0]), parseInt(parts[1]));
    }

    private doorsCallback(x: number, y: number): void {
        this.doorsList.push(new Point(x, y));
    }

    private diggerCallback(x: number, y: number, wall: number): void {
        if (wall) {
            return;
        }
        this.generatedTiles[this.coordinatesToKey(x, y)] = Tile.floor;
    }

}