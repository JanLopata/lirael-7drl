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
    CorridorFloor

}

export class Tile {
    static readonly floor = new Tile(TileType.Floor, new Glyph("."));
    static readonly box = new Tile(TileType.Box, new Glyph("#", "#654321"));
    static readonly searchedBox = new Tile(TileType.SearchedBox, new Glyph("#", "#666"));
    static readonly destroyedBox = new Tile(TileType.DestroyedBox, new Glyph("x", "#555"));
    static readonly warpPoint = new Tile(TileType.WarpPoint, new Glyph("*", "#ff7700"));
    static readonly door = new Tile(TileType.Door, new Glyph("+", "#654321"))


    constructor(public readonly type: TileType, public glyph: Glyph) { }
}