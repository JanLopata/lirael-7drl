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

    minus(another: Point): Point {
        return this.plus(another.reverse());
    }

    reverse(): Point {
        return new Point(-this.x, -this.y);
    }

    dist4(another: Point) {
        return this.minus(another).norm4();
    }

    scale(factor: number) {
        return new Point(Math.round(this.x * factor), Math.round(this.y * factor));
    }

    norm4(): number {
        return Math.abs(this.x) + Math.abs(this.y);
    }

    public toString = () : string => {
        return this.x + "," + this.y;
    }

}