import {Tile, TileType} from "./tile";
import {Glyph} from "../glyph";

function glyphChar(): string {
    return "\"";
}

export class Bookshelf extends Tile {

    constructor() {
        super(TileType.Bookshelf, new Glyph(glyphChar(), Tile.box.glyph.foregroundColor, Tile.box.glyph.backgroundColor));
        this.glyph.character = glyphChar();
    }

}