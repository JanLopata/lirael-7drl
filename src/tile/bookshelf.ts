import {Tile, TileType} from "./tile";
import {Actor} from "../actor/actor";
import {Game} from "../game";
import {Player} from "../actor/player";
import {RNG} from "rot-js";
import {Glyph} from "../glyph";

const basicColor = "#b36456";
const searchedColor = "#663830";
const interestingColor = "#ab73e6";

const glyphChar = "#";

function getColor(bookChance: number): string {
    if (bookChance > 0.25) {
        return interestingColor;
    }
    if (bookChance <= 0) {
        return searchedColor;
    }
    return basicColor;
}

function getBookChance(dangerZone: boolean, rare: boolean): number {
    let result = 0.05;
    if (dangerZone)
        result += 0.15;
    if (rare)
        result += 0.6;
    return result;
}

export class Bookshelf extends Tile {
    private bookChance: number;
    private readonly dangerZone: boolean

    constructor(dangerZone: boolean) {
        super(TileType.Bookshelf, new Glyph(glyphChar, basicColor), false);
        this.dangerZone = dangerZone;
        this.reset();
    }

    reset() {
        const rare = RNG.getUniform() < 0.05;
        this.bookChance = getBookChance(this.dangerZone, rare);
        this.glyph.foregroundColor = getColor(this.bookChance);
    }

    interactWith(actor: Actor, game: Game): boolean {
        if (actor instanceof Player) {

            if (RNG.getUniform() < this.bookChance) {
                this.bookFound(game);
            } else {
                game.addLogMessage("There is no interesting book in this bookshelf.");
            }
            this.bookChance = 0;
            this.glyph.foregroundColor = getColor(this.bookChance);

            return true;
        }
        return false;
    }

    private bookFound(game: Game) {
        game.addLogMessage("You have found interesting book!")
        game.statusLine.booksFound++;
    }

}