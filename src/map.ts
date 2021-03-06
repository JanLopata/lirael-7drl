import {RNG} from "rot-js";
import {Game} from "./game";
import {Tile, TileType} from "./tile/tile";
import {Point} from "./point";
import {DisplaySizing} from "./display_sizing";
import {Door} from "./tile/door";
import {WarpTile} from "./tile/warptile";

export class Map {
    map: { [key: string]: Tile };

    constructor(private game: Game) {
        this.map = {};
    }

    setTile(x: number, y: number, tile: Tile): void {
        this.map[this.coordinatesToKey(x, y)] = tile;
    }

    getRandomTilePositions(type: TileType, quantity: number = 1): Point[] {
        let buffer: Point[] = [];
        let result: Point[] = [];
        for (let key in this.map) {
            if (this.map[key].type === type) {
                buffer.push(this.keyToPoint(key));
            }
        }

        let index: number;
        while (buffer.length > 0 && result.length < quantity) {
            index = Math.floor(RNG.getUniform() * buffer.length);
            result.push(buffer.splice(index, 1)[0]);
        }
        return result;
    }

    getTileType(x: number, y: number): TileType {
        return this.map[this.coordinatesToKey(x, y)].type;
    }

    getTile(x: number, y: number): Tile {
        return this.map[this.coordinatesToKey(x, y)];
    }

    isPassable(x: number, y: number): boolean {
        let tile = this.getTile(x, y);
        if (tile == null)
            return false;

        return tile.isPassable();
    }

    isNavigable(x: number, y: number, unlockStrength: number): boolean {
        let tile = this.getTile(x, y);
        if (tile == null)
            return false;

        if (tile instanceof Door) {
            return tile.locked <= unlockStrength;
        }

        return tile.isPassable();
    }

    draw(playerPosition: Point, displaySizing: DisplaySizing): void {
        const origin = playerPosition.reverse().plus(displaySizing.center)
        for (let key in this.map) {
            let position = this.keyToPoint(key).plus(origin);
            if (!displaySizing.checkFits(position)) {
                continue;
            }
            let mapElement = this.map[key];
            if (mapElement instanceof WarpTile) {
                continue;
            }
            this.game.draw(position, mapElement.glyph);
        }
    }

    private coordinatesToKey(x: number, y: number): string {
        return x + "," + y;
    }

    iteratePointsAndTiles(callback: (point: Point, tile: Tile) => void) {
        for (let mapKey in this.map) {
            let keyPoint = this.keyToPoint(mapKey);
            let keyTile = this.map[mapKey];
            callback(keyPoint, keyTile);
        }
    }

    public enlarge() {

        const newTiles: {[key: string]: number} = {}

        for (let mapKey in this.map) {
            let point = this.keyToPoint(mapKey);
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i == 0 && j==0)
                        continue;

                    const enlargedKey = this.coordinatesToKey(point.x + i, point.y + j);
                    newTiles[enlargedKey] = 0; // dummy value
                }
            }
        }

        // enlarge with empty tile
        for (let mapKey in newTiles) {
            if (this.map[mapKey] == null) {
                this.map[mapKey] = Tile.empty;
            }
        }
    }

    public keyToPoint(key: string): Point {
        let parts = key.split(",");
        return new Point(parseInt(parts[0]), parseInt(parts[1]));
    }

}