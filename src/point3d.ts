import {Point} from "./point";

export class Point3D {
    constructor(public level: number, public x: number, public y: number) { }

    equals(another: Point3D): boolean {
        if (another == null) {
            return false;
        }
        return this.level == another.level && this.x == another.x && this.y == another.y;
    }

    toKey(): string {
        return this.level + "," + this.x + "," + this.y;
    }

    toPoint(): Point {
        return new Point(this.x, this.y);
    }

}