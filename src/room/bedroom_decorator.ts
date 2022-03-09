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

        const size = room.rd.minus(room.lt);
        let vertical = size.x < size.y;
        console.log(`decorating bedroom with lt=${room.lt} rd=${room.rd}, vertical=${vertical}`)
        let snake = BedroomDecorator.snake(room.lt, room.rd);
        snake.push(snake[0]);

        let bedPlaced = false;
        let doorNearby = BedroomDecorator.doorNearby(snake[0], room);
        for (let i = 1; i < snake.length - 1; i++) {
            const nextDoorNearby = BedroomDecorator.doorNearby(snake[i], room);
            if (!(bedPlaced || doorNearby || nextDoorNearby)) {
                // place bed
                console.log(`placing bed to ${snake[i]}`);
                let bedTile = new Bed();
                this.map.setTile(snake[i - 1].x, snake[i - 1].y, bedTile);
                this.map.setTile(snake[i].x, snake[i].y, bedTile);
                bedPlaced = true;
                continue;
            } else {
                console.log(`could not place bed to ${snake[i]}`);
            }

            if (nextDoorNearby && RNG.getUniform() > 0.7) {
                // place bookshelf
                console.log(`placing bookshelf to ${snake[i]}`);
                this.map.setTile(snake[i].x, snake[i].y, new Bookshelf());
            }

        }

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