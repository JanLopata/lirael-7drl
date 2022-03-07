import {RNG} from "rot-js";
import {Map} from "./map"
import {Game} from "./game";
import {Tile, TileType} from "./tile";
import {Point} from "./point";
import {DisplaySizing} from "./display_sizing";
import {SpiralPart} from "./spiral_part";
import {Point3D} from "./point3d";

export class Multimap {
    private multimap: { [level: number]: Map }

    constructor(private game: Game) {
        this.multimap = {};
    }

    getMap(level: number): Map {
        return this.multimap[level];
    }

    generateMultimap(width: number, height: number): void {
        this.multimap = {};
        this.multimap[0] = new Map(this.game);
        this.multimap[1] = new Map(this.game);
        this.multimap[2] = new Map(this.game);

        const leftSpiralPart = new SpiralPart(0, new Point(0, 10), new Point(0, 30), 7, true);
        const rightSpiralPart = new SpiralPart(1, new Point(0, 10), new Point(0, 30), 7, false);
        const anotherLeftSpiralPart = new SpiralPart(2, new Point(0, 10), new Point(0, 30), 7, true);

        leftSpiralPart.imprintToMap(this.getMap(0))
        rightSpiralPart.imprintToMap(this.getMap(1))
        anotherLeftSpiralPart.imprintToMap(this.getMap(2));

        leftSpiralPart.connect(this)
        rightSpiralPart.connect(this)
        anotherLeftSpiralPart.connect(this)
    }

    setTile(level: number, x: number, y: number, tile: Tile): void {
        this.multimap[level].setTile(x, y, tile);
    }

    getRandomTilePositions(type: TileType, quantity: number = 1): Point3D[] {
        let buffer: Point3D[] = [];
        let result: Point3D[] = [];
        console.log(this)
        for (let levelKey in this.multimap) {
            let level = parseInt(levelKey);
            console.log("searching for tiles in level " + level)
            let levelMap = this.getMap(level).map
            for (let key in levelMap) {
                if (levelMap[key].type === type) {
                    let point = this.keyToPoint(key);
                    buffer.push(new Point3D(level, point.x, point.y));
                }
            }
        }
        console.log("buffer size: " + buffer.length)

        let index: number;
        while (buffer.length > 0 && result.length < quantity) {
            index = Math.floor(RNG.getUniform() * buffer.length);
            result.push(buffer.splice(index, 1)[0]);
        }
        return result;
    }

    getTileType(level: number, x: number, y: number): TileType {
        return this.getMap(level).getTileType(x, y);
    }

    isPassable(level: number, x: number, y: number): boolean {
        let map = this.getMap(level);
        if (map == null) {
            console.warn("map is empty for level " + level)
            return false;
        }
        return map.isPassable(x, y);
    }

    draw(playerPosition: Point3D, displaySizing: DisplaySizing): void {
        const origin = playerPosition.toPoint().reverse().plus(displaySizing.center)
        let map = this.getMap(playerPosition.level);

        for (let key in map) {
            let position = this.keyToPoint(key).plus(origin);
            if (!displaySizing.checkFits(position)) {
                continue;
            }
            this.game.draw(position, map[key].glyph);
        }
    }

    private keyToPoint(key: string): Point {
        let parts = key.split(",");
        return new Point(parseInt(parts[0]), parseInt(parts[1]));
    }

}