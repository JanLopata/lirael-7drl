import {Tile} from "./tile";
import {Glyph} from "./glyph";

export class WarpTile extends Tile {

    constructor(public targetLevel: number) {
        super(Tile.warpPoint.type, new Glyph(targetLevel.toString(), Tile.warpPoint.glyph.foregroundColor, Tile.warpPoint.glyph.backgroundColor));
        this.targetLevel = targetLevel;
    }


}