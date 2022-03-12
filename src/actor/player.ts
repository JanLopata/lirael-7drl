import { KEYS, DIRS } from "rot-js";
import { Game } from "../game";
import { Actor, ActorType } from "./actor";
import { Point } from "../point";
import { Glyph } from "../glyph";
import { InputUtility } from "../input-utility";
import {Point3D} from "../point3d";
import {KirrithPrimitive} from "./kirrithPrimitive";
import {Clair} from "./clair";
import {Sending} from "./sending";

export class Player implements Actor {
    glyph: Glyph;
    type: ActorType;
    private keyMap: { [key: number]: number }

    constructor(private game: Game, public position: Point3D) {
        this.glyph = new Glyph("@", "#d95763");
        this.type = ActorType.Player;

        this.keyMap = {};
        this.keyMap[KEYS.VK_NUMPAD8] = 0; // up
        this.keyMap[KEYS.VK_NUMPAD9] = 1;
        this.keyMap[KEYS.VK_NUMPAD6] = 2; // right
        this.keyMap[KEYS.VK_NUMPAD3] = 3;
        this.keyMap[KEYS.VK_NUMPAD2] = 4; // down
        this.keyMap[KEYS.VK_NUMPAD1] = 5;
        this.keyMap[KEYS.VK_NUMPAD4] = 6; // left
        this.keyMap[KEYS.VK_NUMPAD7] = 7;
    }

    act(): Promise<any> {
        return InputUtility.waitForInput(this.handleInput.bind(this));
    }

    private handleInput(event: KeyboardEvent): boolean {
        let validInput = false;
        let code = event.keyCode;
        if (code in this.keyMap) {
            let diff = DIRS[8][this.keyMap[code]];
            let newPoint = new Point(this.position.x + diff[0], this.position.y + diff[1]);
            let newPoint3d = new Point3D(this.position.level, newPoint.x, newPoint.y);
            if (this.hasModifier(event)) {
                return this.checkInteraction(newPoint3d)
            }

            if (!this.game.mapIsPassable(newPoint3d)) {
                return this.checkInteraction(newPoint3d);
            }

            const npcInWay = this.game.getNpcOn(newPoint3d);
            if (npcInWay != null) {
                return this.interactWith(npcInWay);
            }

            this.position = newPoint3d;
            this.game.warper.tryActorLevelWarp(this);

            validInput = true;
        } else {
            validInput = code === KEYS.VK_NUMPAD5; // Wait a turn
        }
        return validInput;
    }

    hasModifier(e: KeyboardEvent): boolean {
        return (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey);
    }

    checkInteraction(target: Point3D): boolean {
        return this.game.interact(this, target);
    }

    getName(): string {
        return "Lirael";
    }

    getUnlockPower(): number {
        return 2;
    }

    private interactWith(npcInWay: Actor) {
        if (npcInWay instanceof KirrithPrimitive) {
            this.game.addLogMessage(
                `There is no way to reasonably talk with %c{${npcInWay.glyph.foregroundColor}}${npcInWay.getName()}%c{}!`);
            return true;
        }
        if (npcInWay instanceof Clair) {
            this.game.addLogMessage(
                `You bump into %c{${npcInWay.glyph.foregroundColor}}${npcInWay.getName()}%c{}. Rude!`);
            return true;
        }
        if (npcInWay instanceof Sending) {
            this.game.addLogMessage(
                `You say Hi! to %c{${npcInWay.glyph.foregroundColor}}${npcInWay.getName()}%c{}.`);
            return true;
        }
        return false;
    }

}