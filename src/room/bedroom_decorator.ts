import {Map} from "../map"
import {RoomProperties} from "./room_property";
import {Point} from "../point";
import {Bed} from "../tile/bed";
import {RNG} from "rot-js";
import {Bookshelf} from "../tile/bookshelf";
import {SnakeHelper} from "./snake_helper";

export class BedroomDecorator {

    constructor(public map: Map) {
        this.map = map;
    }

    public decorate(room: RoomProperties) {

        let snake = SnakeHelper.getSnake(room.lt, room.rd);
        SnakeHelper.rotateSnakeRandomly(snake);
        snake.push(snake[0]);

        let bedPlaced = false;
        let doorNearby = BedroomDecorator.doorNearby(snake[0], room);
        for (let i = 1; i < snake.length - 1; i++) {
            const nextDoorNearby = BedroomDecorator.doorNearby(snake[i], room);
            if (!(bedPlaced || doorNearby || nextDoorNearby)) {
                // place bed
                this.placeBed(room, snake[i - 1], snake[i]);
                bedPlaced = true;
                continue;
            }
            doorNearby = nextDoorNearby;

            if (!nextDoorNearby && RNG.getUniform() > 0.7) {
                // place bookshelf
                this.map.setTile(snake[i].x, snake[i].y, new Bookshelf(room.danger));
            }
        }
        if (!bedPlaced) {
            // fallback bed placing
            let center = room.lt.plus(room.rd).scale(0.5);
            this.placeBed(room, center, center.plus(new Point(0, 1)));
        }
    }

    private placeBed(room: RoomProperties, point1: Point, point2: Point) {
        let bedTile = new Bed(room);
        this.map.setTile(point1.x, point1.y, bedTile);
        this.map.setTile(point2.x, point2.y, bedTile);
    }

    private static doorNearby(point: Point, room: RoomProperties): boolean {
        for (let door of room.doors) {
            if (door.dist4(point) <= 1) {
                return true;
            }
        }
        return false;
    }


}