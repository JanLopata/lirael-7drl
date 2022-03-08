export class Point {
    constructor(public x: number, public y: number) { }

    equals(point: Point): boolean {
        return this.x == point.x && this.y == point.y;
    }

    toKey(): string {
        return this.x + "," + this.y;
    }

    plus(another: Point): Point {
        return new Point(this.x + another.x, this.y + another.y);
    }

    reverse(): Point {
        return new Point(-this.x, -this.y);
    }

    public toString = () : string => {
        return this.x + "," + this.y
    }

}