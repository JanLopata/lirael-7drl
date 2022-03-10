import {Tile, TileType} from "./tile";
import {Glyph} from "../glyph";
import {RNG} from "rot-js";

function glyphChar(): string {
    return "%";
}

const colors = ["#ffffff",
    "#d95763",
    "#cbdbfc",
    "#37946e",
    "#eec39a",
];

function chooseColor(): string {
    return RNG.getItem(colors);
}

export class Bed extends Tile {

    constructor() {
        super(TileType.Bed, new Glyph(glyphChar(), chooseColor()));
        this.glyph.character = glyphChar();
    }

}