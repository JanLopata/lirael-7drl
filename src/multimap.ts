import {RNG} from "rot-js";
import {Map} from "./map"
import {Game} from "./game";
import {Tile, TileType} from "./tile/tile";
import {Point} from "./point";
import {DisplaySizing} from "./display_sizing";
import {SpiralPart} from "./spiral_part";
import {Point3D} from "./point3d";
import {WarpTile} from "./tile/warptile";
import {RoomsAround} from "./rooms_around";
import {RoomDecorator} from "./room/room_decorator";

export class Multimap {
    private multimap: { [level: number]: Map }
    private spirals: SpiralPart[];
    private roomsAround: RoomsAround[] = [];
    private roomDecorator: RoomDecorator;

    constructor(private game: Game) {
        this.multimap = {};
    }

    getMap(level: number): Map {
        return this.multimap[level];
    }

    generateMultimap(width: number, height: number): void {
        this.roomDecorator = new RoomDecorator();
        this.multimap = {};
        this.spirals = [];
        this.roomsAround = [];
        for (let i = 0; i < 7; i++) {
            this.generateLevel(i);
        }
        this.connectSpirals();
    }

    generateLevel(level: number) {
        this.multimap[level] = new Map(this.game);

        const left = level % 2 == 0;
        const spiralPart = new SpiralPart(level, 4, 9, left)
        spiralPart.imprintToMap(this.getMap(level));
        this.spirals.push(spiralPart);

        const roomsAround = new RoomsAround(level, spiralPart, 15, this.roomDecorator);
        roomsAround.imprintToMap(this.getMap(level));
        this.roomsAround.push(roomsAround);
    }

    connectSpirals() {
        for (let spiral of this.spirals) {
            spiral.connect(this);
        }
    }

    setTile(level: number, x: number, y: number, tile: Tile): void {
        this.multimap[level].setTile(x, y, tile);
    }

    getRandomTilePositions(type: TileType, quantity: number = 1): Point3D[] {
        let buffer: Point3D[] = [];
        let result: Point3D[] = [];
        for (let levelKey in this.multimap) {
            let level = parseInt(levelKey);
            let levelMap = this.getMap(level).map
            for (let key in levelMap) {
                if (levelMap[key].type === type) {
                    let point = Multimap.keyToPoint(key);
                    buffer.push(new Point3D(level, point.x, point.y));
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

    getRandomWarpFromTo(fromLevel: number, toLevel: number): Point3D {
        let buffer: Point3D[] = [];
        let levelMap = this.getMap(fromLevel).map
        for (let key in levelMap) {
            let levelMapElement = levelMap[key];
            if (levelMapElement instanceof WarpTile) {
                if (levelMapElement.targetLevel == toLevel) {
                    let point = Multimap.keyToPoint(key);
                    buffer.push(new Point3D(fromLevel, point.x, point.y));
                }
            }
        }
        const index = Math.floor(RNG.getUniform() * buffer.length);
        return buffer[index];

    }

    getRandomTargets(filter: (tile: Tile) => boolean, quantity: number = 1): Point3D[] {

        let buffer: Point3D[] = [];
        let result: Point3D[] = [];

        for (let levelKey in this.multimap) {
            let level = parseInt(levelKey);
            let levelMap = this.getMap(level).map
            for (let key in levelMap) {
                const tile = levelMap[key]
                if (filter(tile)) {
                    let point = Multimap.keyToPoint(key);
                    buffer.push(new Point3D(level, point.x, point.y));
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

    getTile(point: Point3D): Tile {
        return this.getMap(point.level).getTile(point.x, point.y);
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
            let position = Multimap.keyToPoint(key).plus(origin);
            if (!displaySizing.checkFits(position)) {
                continue;
            }
            this.game.draw(position, map[key].glyph);
        }
    }

    private static keyToPoint(key: string): Point {
        let parts = key.split(",");
        return new Point(parseInt(parts[0]), parseInt(parts[1]));
    }

}