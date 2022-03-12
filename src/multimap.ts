import {RNG} from "rot-js";
import {Map} from "./map"
import {Game} from "./game";
import {Tile, TileType} from "./tile/tile";
import {Point} from "./point";
import {SpiralPart} from "./spiral_part";
import {Point3D} from "./point3d";
import {WarpTile} from "./tile/warptile";
import {RoomsAround} from "./rooms_around";
import {RoomDecorator} from "./room/room_decorator";
import {Actor} from "./actor/actor";
import {RoomProperties} from "./room/room_property";

type SpiralSize = { inner: number, outer: number };

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
        this.decorateRooms();
        this.connectSpirals();
    }

    private decorateRooms() {
        const allRooms: RoomProperties[] = [];
        for (let roomsAround of this.roomsAround) {
            for (let room of roomsAround.getRooms()) {
                allRooms.push(room);
            }
        }
        RNG.shuffle(allRooms);
        for (let room of allRooms) {
            this.roomDecorator.decorate(room, this.getMap(room.level));
        }
    }

    generateLevel(level: number) {
        this.multimap[level] = new Map(this.game);

        const left = level % 2 == 0;
        let spiralSize = Multimap.getSpiralSize(level);
        const spiralPart = new SpiralPart(level, spiralSize.inner, spiralSize.outer, left)
        spiralPart.imprintToMap(this.getMap(level));
        this.spirals.push(spiralPart);

        const roomsAround = new RoomsAround(level, spiralPart, 13 + level);
        roomsAround.imprintToMap(this.getMap(level));
        this.roomsAround.push(roomsAround);
    }

    private static getSpiralSize(level: number) : SpiralSize{
        const inner = 3 + Math.floor(level * 0.6);
        const outer = 6 + Math.floor(level * 1.2);
        return {inner, outer};
    }

    connectSpirals() {
        for (let spiral of this.spirals) {
            spiral.connect(this);
        }
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

    isPassable(point: Point3D): boolean {
        let map = this.getMap(point.level);
        return map.isPassable(point.x, point.y);
    }

    assignBedrooms(actors: Actor[]) {
        let shuffledRoomsAround = RNG.shuffle([...this.roomsAround]);
        for (let roomsAround of shuffledRoomsAround) {
            roomsAround.assignBedrooms(actors);
        }
    }

    private static keyToPoint(key: string): Point {
        let parts = key.split(",");
        return new Point(parseInt(parts[0]), parseInt(parts[1]));
    }

}