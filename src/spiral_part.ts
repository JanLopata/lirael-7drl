import {Map} from "./map"
import {Point} from "./point";
import {Tile} from "./tile";

export class SpiralPart {

    private level: number;
    private topPoint: Point
    private bottomPoint: Point
    private width: number;
    private orientedLeft: boolean;

    private center: Point;
    private topDownPoint: Point;
    private bottomUpPoint: Point;
    private diameter: number

    constructor(level: number, topPoint: Point, bottomPoint: Point, width: number, left: boolean) {
        this.level = level;
        this.topPoint = topPoint;
        this.bottomPoint = bottomPoint
        this.width = width;
        this.orientedLeft = left;

        if (topPoint.x != bottomPoint.x) {
            console.error("top and bottom mismatch")
            return
        }

        this.topDownPoint = topPoint.plus(new Point(0, width));
        this.bottomUpPoint = bottomPoint.plus(new Point(0, -width));
        this.center = new Point(topPoint.x, (topPoint.y + bottomPoint.y) / 2)
        this.diameter = (-topPoint.y + bottomPoint.y) / 2;
    }

    public imprintToMap(map: Map) {

        const diamLSquared = this.diameter * this.diameter;
        const diamSSquared = (this.diameter - this.width) * (this.diameter - this.width);

        console.log("diameter is: " + this.diameter)
        const left = this.orientedLeft ? -this.diameter : 0;
        const right = this.orientedLeft ? 0 : this.diameter

        for (let i = left; i < right; i++) {
            for (let j = -this.diameter; j < this.diameter; j++) {
                let localR = i * i + j * j;
                if (diamSSquared < localR && localR < diamLSquared) {
                    let x = this.center.x + i;
                    let y = this.center.y + j;
                    console.log("updated tile in " + x + "," + y)
                    map.setTile(x, y, Tile.floor);
                }
            }
        }

    }

}