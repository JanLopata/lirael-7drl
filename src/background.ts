import Simplex from "rot-js/lib/noise/simplex";
import {Glyph} from "./glyph";
import {RNG} from "rot-js";

const chars = ["#", "#", '#', '/', " ", "\\", "(", ")"];
const colors = ["#395562", "#3e5b69", "#254352", "#425f6e",
    "#395e6c", "#254c59", "#324c50", "#073e46"]

export class Background {

    noiseMap: { [key: string]: Simplex };
    glyphMap: { [key: string]: Glyph }
    backgroundMap: { [key: string]: string }

    constructor() {
        this.noiseMap = {};
        this.glyphMap = {};
        this.backgroundMap = {};
    }

    getOrCreateGlyph(key: string) {
        if (this.glyphMap[key] == null) {
            this.glyphMap[key] = new Glyph(RNG.getItem(chars), RNG.getItem(colors));
        }
        return this.glyphMap[key];
    }

    getGlyph(level: number, x: number, y: number): Glyph {

        let backgroundMapKey = this.toXYKey(level, x, y);

        if (this.backgroundMap[backgroundMapKey] == null) {

            let noise = this.getNoise(level, x, y);
            this.backgroundMap[backgroundMapKey] = "" + noise;
        }

        return this.getOrCreateGlyph(this.backgroundMap[backgroundMapKey]);
    }

    getNoise(level1: number, x: number, y: number): number {

        let key = this.toKey(level1);
        if (this.noiseMap[key] == null) {
            this.noiseMap[key] = new Simplex();
        }

        return Math.floor(this.noiseMap[key].get(x / 10, y / 10) * 10);
    }


    private toKey(level: number) {
        return "" + level;
    }

    private toXYKey(level: number, x: number, y: number): string {
        return level + ";" + x + ";" + y;
    }


}