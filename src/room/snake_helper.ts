import {Point} from "../point";
import {RNG} from "rot-js";

export class SnakeHelper {

    static getSnake(lt: Point, rd:Point) : Point[]{
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

    // TODO: could be generic and effective
    static rotateSnakeRandomly(snake: Point[]) {
        let shift = RNG.getUniformInt(0, snake.length - 1);
        for (let i = 0; i < shift; i++) {
            let first = snake.shift();
            snake.push(first);
        }
    }



}