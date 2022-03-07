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

    generateMap(width: number, height: number): void {
        this.multimap = {};
        this.multimap[0] = new Map(this.game);
        this.multimap[1] = new Map(this.game);

        const leftSpiralPart = new SpiralPart(0, new Point(0, 10), new Point(0, 30), 7, true);
        const rightSpiralPart = new SpiralPart(1, new Point(0, 10), new Point(0, 30), 7, false);

        leftSpiralPart.imprintToMap(this.getMap(0))
        rightSpiralPart.imprintToMap(this.getMap(1))
    }

    setTile(level: number, x: number, y: number, tile: Tile): void {
        this.multimap[level].setTile(x, y, tile);
    }

    getRandomTilePositions(type: TileType, quantity: number = 1): Point3D[] {
        let buffer: Point3D[] = [];
        let result: Point3D[] = [];
        for (let levelKey in this.multimap) {
            let multimapElement = this.multimap[levelKey];
            for (let key in multimapElement) {
                if (multimapElement[key].type === type) {
                    let point = this.keyToPoint(key);
                    buffer.push(new Point3D(parseInt(levelKey), point.x, point.y));
                }
            }
        }

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
        return this.getMap(level).isPassable(x, y);
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