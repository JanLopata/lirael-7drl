import {Tile, TileType} from "./tile";
import {Glyph} from "../glyph";
import {RNG} from "rot-js";
import {Actor} from "../actor/actor";
import {Game} from "../game";
import {RoomProperties} from "../room/room_property";
import {Player} from "../actor/player";

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

    private room: RoomProperties;

    constructor(room: RoomProperties) {
        super(TileType.Bed, new Glyph(glyphChar(), chooseColor()), false);
        this.glyph.character = glyphChar();
        this.room = room;
    }

    interactWith(actor: Actor, game: Game): boolean {

        if (actor instanceof Player) {

            if (this.room.occupant == null) {
                game.addLogMessage(`You are looking at unoccupied bed. You should leave it alone.`)
                return true;
            }

            if (actor.getName() == this.room.occupant.getName()) {

                if (game.statusLine.turns * 2 < game.statusLine.turnsMax) {
                    game.addLogMessage(`It is too early to go back to sleep, explore some more!`);
                    return true;
                }

                if (game.statusLine.booksFound == 0) {
                    game.addLogMessage(`You can't go to sleep, there must be some clue in those books around!`);
                    return true;
                }

                game.endTheGameReachingBed();
                return true;
            }

            game.addLogMessage(`You are inspecting ` +
                `%c{${this.room.occupant.glyph.foregroundColor}}${this.room.occupant.getName()}'s%c{} bed. Rude!`);
            return true;

        }
        return true;

    }


}