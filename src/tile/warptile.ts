import {Tile} from "./tile";
import {Glyph} from "../glyph";

export class WarpTile extends Tile {

    constructor(public targetLevel: number) {
        super(Tile.warpPointTemplate.type,
            new Glyph(targetLevel.toString(),
                Tile.warpPointTemplate.glyph.foregroundColor,
                Tile.warpPointTemplate.glyph.backgroundColor),
            WarpTile.warpPointTemplate.isPassable());
        this.targetLevel = targetLevel;
    }


}