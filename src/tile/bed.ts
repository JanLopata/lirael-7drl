import {Tile, TileType} from "./tile";
import {Glyph} from "../glyph";

function glyphChar(): string {
    return "=";
}

export class Bed extends Tile {

    constructor() {
        super(TileType.Bed, new Glyph(glyphChar(), Tile.box.glyph.foregroundColor, Tile.box.glyph.backgroundColor));
        this.glyph.character = glyphChar();
    }

}