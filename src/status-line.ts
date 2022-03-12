import { Game } from "./game";
import { Point } from "./point";
import { padRight, padLeft } from "./text-utility";

export class StatusLine {
    night: number;
    turns: number;
    turnsMax: number;
    booksFound: number;

    constructor(private game: Game, private position: Point, private maxWidth: number, params?: any) {
        if (!params) {
            params = {};
        }
        this.night = params.night || 1;
        this.turns = params.turns || 0;
        this.turnsMax = params.turnsMax || 0;
        this.booksFound = params.booksFound || 0;
    }

    reset(): void {
        this.turns = 0;
        this.booksFound = 0;
    }

    draw(): void {
        let text = ""
            + `Turns: ${padLeft(this.turns.toString(), 3)} / ${this.turnsMax.toString()} `
            + `Books found: ${padRight(this.booksFound.toString(), 3)}`;
        this.game.drawText(this.position, text, this.maxWidth);
    }
}