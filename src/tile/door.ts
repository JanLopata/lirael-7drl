import {Tile} from "./tile";
import {Glyph} from "../glyph";

function glyphChar(locked: number) {
    if (locked < 1)
        return "/";
    return "+";
}


export class Door extends Tile {

    constructor(public locked: number) {
        super(Tile.warpPoint.type, new Glyph(glyphChar(locked), Tile.door.glyph.foregroundColor, Tile.door.glyph.backgroundColor));
        this.locked = locked;
    }

    close(lockStrength: number) {
        this.locked = lockStrength;
        this.glyph.character = glyphChar(this.locked);
    }

    isOpen() :boolean {
        return this.locked <= 0;
    }

    pryOpen(strength: number): boolean {
        if (strength >= this.locked) {
            this.locked = 0;
            this.glyph.character = glyphChar(this.locked);
            return true;
        }
        return false;
    }

}