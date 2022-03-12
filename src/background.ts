import Simplex from "rot-js/lib/noise/simplex";
import {Glyph} from "./glyph";
import {RNG} from "rot-js";

const chars = ["#", "#", '#', '/', " ", "\\", "(", ")"];

export class Background {

    noiseMap: { [key: string]: Simplex };
    glyphMap: { [key: string]: Glyph}
    backgroundMap: {[key: string]: string}

    constructor() {
        this.noiseMap = {};
        this.glyphMap = {};
        this.backgroundMap = {};
    }

    getOrCreateGlyph(key: string) {
        if (this.glyphMap[key] == null) {
            this.glyphMap[key] = new Glyph(RNG.getItem(chars));
        }
        return this.glyphMap[key];
    }

    getGlyph(level1: number, level2: number, x: number, y: number): Glyph {

        let backgroundMapKey = this.toXYKey(level1, level2, x, y);

        if (this.backgroundMap[backgroundMapKey] == null) {

            let noise = this.getNoise(level1, level2, x, y);
            this.backgroundMap[backgroundMapKey] = "" + noise;
        }

        return this.getOrCreateGlyph(this.backgroundMap[backgroundMapKey]);
    }

    getNoise(level1: number, level2: number, x: number, y: number): number {

        let key = this.toKey(level1, level2);
        if (this.noiseMap[key] == null) {
            this.noiseMap[key] = new Simplex();
        }

        return Math.floor(this.noiseMap[key].get(x / 10, y / 10) * 10);
    }


    private toKey(level1: number, level2: number) {
        return level1 + "," + level2;
    }

    private toXYKey(level1: number, level2: number, x: number, y: number): string {
        return level1 + ";" + level2 + ";" + x + ";" + y;
    }


}