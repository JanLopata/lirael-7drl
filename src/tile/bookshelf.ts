import {Tile, TileType} from "./tile";

function glyphChar(): string {
    return "\"";
}

export class Bookshelf extends Tile {

    constructor() {
        super(TileType.Bookshelf, Tile.box.glyph);
        this.glyph.character = glyphChar();
    }

}