import {Point} from "./point";

export class Point3D {
    constructor(public level: number, public x: number, public y: number) { }

    equals(point: Point3D): boolean {
        return this.level == point.level && this.x == point.x && this.y == point.y;
    }

    toKey(): string {
        return this.level + "," + this.x + "," + this.y;
    }

    toPoint(): Point {
        return new Point(this.x, this.y);
    }

}