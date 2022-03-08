import {Map} from "./map"
import {Tile, TileType} from "./tile/tile";
import {SpiralPart} from "./spiral_part";
import Digger from "rot-js/lib/map/digger";
import {Point} from "./point";
import {Door} from "./tile/door";


export class RoomsAround {

    private readonly generatedTiles: { [key: string]: Tile };
    private readonly doorsList: Point[];

    private readonly level: number;
    private readonly spiralPart: SpiralPart;
    private readonly outsideDiameter: number;
    private readonly width: number;
    private readonly height: number;
    private readonly shift: Point;

    constructor(level: number, spiralPart: SpiralPart, outsideDiameter: number) {
        this.level = level;
        this.spiralPart = spiralPart;
        this.outsideDiameter = outsideDiameter;
        this.doorsList = [];
        this.generatedTiles = {};
        this.width = Math.round(1.7 * this.outsideDiameter);
        this.height = 2 * this.outsideDiameter;

        const shiftX = spiralPart.orientedLeft ? - this.width : 0;
        this.shift = new Point(shiftX, -this.outsideDiameter);

        this.generate();

    }

    generate(): void {
        let digger = new Digger(this.width, this.height,
            {"dugPercentage": 0.6, "corridorLength": [1, 3], "roomHeight": [4, 9], "roomWidth": [4, 9]})
        digger.create(this.diggerCallback.bind(this));

        for (let room of digger.getRooms()) {
            const x = this.shift.x + room.getCenter()[0];
            const y = this.shift.y + room.getCenter()[1]
            console.log("level " + this.level + " room: " + x + "," + y);
            room.getDoors(this.doorsCallback.bind(this));
        }
        console.log("created rooms: " + digger.getRooms().length)
    }

    public imprintToMap(map: Map) {

        for (let generatedTilesKey in this.generatedTiles) {
            let point = this.keyToPoint(generatedTilesKey).plus(this.shift);
            if (map.getTile(point.x, point.y) == null) {
                map.setTile(point.x, point.y, Tile.floor);
            }
        }

        for (let doorPoint of this.doorsList) {
            const point = doorPoint.plus(this.shift);
            console.log("adding doors to level " + this.level + ' ' + point)

            if (map.getTileType(point.x, point.y) == TileType.Floor) {
                map.setTile(point.x, point.y, new Door(1));
            }
        }

    }

    private coordinatesToKey(x: number, y: number): string {
        return x + "," + y;
    }

    private keyToPoint(key: string): Point {
        let parts = key.split(",");
        return new Point(parseInt(parts[0]), parseInt(parts[1]));
    }

    private doorsCallback(x: number, y: number): void {
        this.doorsList.push(new Point(x, y));
    }

    private diggerCallback(x: number, y: number, wall: number): void {
        if (wall) {
            return;
        }
        this.generatedTiles[this.coordinatesToKey(x, y)] = Tile.floor;
    }

}