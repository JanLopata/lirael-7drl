import {Map} from "./map"
import {Tile} from "./tile";
import {SpiralPart} from "./spiral_part";
import Digger from "rot-js/lib/map/digger";
import {Point} from "./point";
import {Door} from "./door";


export class RoomsAround {

    private generatedTiles: { [key: string]: Tile };
    private doorsList: Point[];

    private readonly level: number;
    private readonly spiralPart: SpiralPart;
    private readonly outsideDiameter: number;

    constructor(level: number, spiralPart: SpiralPart, outsideDiameter: number) {
        this.level = level;
        this.spiralPart = spiralPart;
        this.outsideDiameter = outsideDiameter;
        this.doorsList = [];
        this.generatedTiles = {};
        this.generate();

    }

    generate(): void {
        let digger = new Digger(this.outsideDiameter * 1.7, 2 * this.outsideDiameter, {"dugPercentage" :0.4})
        digger.create(this.diggerCallback.bind(this));

        for (let room of digger.getRooms()) {
            room.getDoors(this.doorsCallback);
        }
        console.log("created rooms: " + digger.getRooms().length )
        
    }

    public imprintToMap(map: Map) {

        const shift = new Point(0, -this.outsideDiameter);

        for (let generatedTilesKey in this.generatedTiles) {
           let point = this.keyToPoint(generatedTilesKey).plus(shift);
           if (map.getTile(point.x, point.y) == null) {
               console.log("adding room tile " + point.x + "," + point.y)
               map.setTile(point.x, point.y, Tile.floor);
           }
        }

        for (let doorPoint of this.doorsList) {
            const point = doorPoint.plus(shift);

            if (map.getTile(point.x, point.y) == null) {
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
        // this.doorsList.push(new Point(x, y));
    }

    private diggerCallback(x: number, y: number, wall: number): void {
        if (wall) {
            return;
        }
        this.generatedTiles[this.coordinatesToKey(x, y)] = Tile.floor;
    }

}