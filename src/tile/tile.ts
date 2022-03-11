import { Glyph } from "../glyph";

export const enum TileType {
    Floor,
    Box,
    SearchedBox,
    DestroyedBox,
    WarpPoint,
    Door,
    Bookshelf,
    Bed,
    Chair,
    Table,
    CorridorFloor,

}

export class Tile {
    static readonly floor = new Tile(TileType.Floor, new Glyph("."), true);
    static readonly box = new Tile(TileType.Box, new Glyph("#", "#99e550"), true);
    static readonly searchedBox = new Tile(TileType.SearchedBox, new Glyph("#", "#666"), true);
    static readonly destroyedBox = new Tile(TileType.DestroyedBox, new Glyph("x", "#555"), true);
    static readonly warpPointTemplate = new Tile(TileType.WarpPoint, new Glyph("*", "#ff7700"), true);
    static readonly door = new Tile(TileType.Door, new Glyph("+", "#847e87"), false)
    static readonly chair = new Tile(TileType.Chair, new Glyph("x", "#7d6c61"), false)
    static readonly table = new Tile(TileType.Table, new Glyph("T", "#779bdc"), false)

    constructor(public readonly type: TileType, public glyph: Glyph, protected passable: boolean) { }

    isPassable() : boolean {
        return this.passable;
    }
}