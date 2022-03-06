import {Point} from "./point";

export class DisplaySizing {
    center: Point;
    topLeft: Point;
    bottomRight: Point

    constructor(center: Point, topLeft: Point, bottomRight: Point) {
        this.center = center;
        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
    }

    public checkFits(position: Point): boolean {
        if (position.x < this.topLeft.x || position.x > this.bottomRight.x)
            return false;

        return !(position.y < this.topLeft.y || position.y > this.bottomRight.y);
    }

}