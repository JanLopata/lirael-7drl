import {Map} from "../map"
import {RoomProperties} from "./room_property";
import {Point} from "../point";
import {Bed} from "../tile/bed";
import {RNG} from "rot-js";
import {Bookshelf} from "../tile/bookshelf";

export class BedroomDecorator {

    constructor(public map: Map) {
        this.map = map;
    }

    public decorate(room: RoomProperties) {

        console.log(`decorating bedroom with lt=${room.lt} rd=${room.rd}`)
        let snake = BedroomDecorator.snake(room.lt, room.rd);
        BedroomDecorator.rotateSnakeRandomly(snake);
        snake.push(snake[0]);

        let bedPlaced = false;
        let doorNearby = BedroomDecorator.doorNearby(snake[0], room);
        for (let i = 1; i < snake.length - 1; i++) {
            const nextDoorNearby = BedroomDecorator.doorNearby(snake[i], room);
            console.log(snake[i], + " ", doorNearby + " " + nextDoorNearby);
            if (!(bedPlaced || doorNearby || nextDoorNearby)) {
                // place bed
                console.log(`placing bed to ${snake[i]}`);
                this.placeBed(room, snake[i - 1], snake[i]);
                bedPlaced = true;
                continue;
            } else {
                console.log(`could not place bed to ${snake[i]}`);
            }
            doorNearby = nextDoorNearby;

            if (!nextDoorNearby && RNG.getUniform() > 0.7) {
                // place bookshelf
                console.log(`placing bookshelf to ${snake[i]}`);
                this.map.setTile(snake[i].x, snake[i].y, new Bookshelf(room.danger));
            }
        }
        if (!bedPlaced) {
            // fallback bed placing
            let center = room.lt.plus(room.rd).scale(0.5);
            console.log(`placing fallback bed to ${center}`);
            this.placeBed(room, center, center.plus(new Point(0, 1)));
        }
    }

    private static rotateSnakeRandomly(snake: Point[]) {
        let shift = RNG.getUniformInt(0, snake.length - 1);
        for (let i = 0; i < shift; i++) {
            let first = snake.shift();
            snake.push(first);
        }
    }

    private placeBed(room: RoomProperties, point1: Point, point2: Point) {
        let bedTile = new Bed(room);
        this.map.setTile(point1.x, point1.y, bedTile);
        this.map.setTile(point2.x, point2.y, bedTile);
    }

    // TODO: reuse
    private static snake(lt: Point, rd:Point) : Point[]{
        let snake: Point[] = [];
        const size = rd.minus(lt);
        for (let x = 0; x < size.x + 1; x++) {
            snake.push(lt.plus(new Point(x, 0)));
        }
        for (let y = 1; y < size.y; y++) {
            snake.push(new Point(rd.x, lt.y + y));
        }
        for (let x = 0; x < size.x + 1; x++) {
            snake.push(rd.plus(new Point(-x, 0)));
        }
        for (let y = 1; y < size.y; y++) {
            snake.push(new Point(lt.x, rd.y - y));
        }
        return snake;
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