import {Display, KEYS, Scheduler} from "rot-js/lib/index";
import Simple from "rot-js/lib/scheduler/simple";

import {Player} from "./actor/player";
import {Point} from "./point";
import {Glyph} from "./glyph";
import {Actor, ActorType} from "./actor/actor";
import {GameState} from "./game-state";
import {StatusLine} from "./status-line";
import {MessageLog} from "./message-log";
import {InputUtility} from "./input-utility";
import {Tile, TileType} from "./tile/tile";
import {DisplaySizing} from "./display_sizing";
import {Multimap} from "./multimap";
import {Point3D} from "./point3d";
import {Warper} from "./warper";
import {Sending} from "./actor/sending";
import {dangerColor, RoomTile} from "./tile/room_tile";
import {RoomType} from "./room/room_decorator";
import {Clair} from "./actor/clair";
import {RoomProperties} from "./room/room_property";
import {ClairSpawnHelper} from "./actor/helpers/clair_spawn_helper";
import {SendingsSpawnHelper} from "./actor/helpers/sendings_spawn_helper";
import {Bookshelf} from "./tile/bookshelf";
import {PlayerSpawnHelper} from "./actor/helpers/player_spawn_helper";
import {KirrithPrimitive} from "./actor/kirrithPrimitive";

export class Game {
    private display: Display;
    private scheduler: Simple;
    private multimap: Multimap;
    statusLine: StatusLine;
    private messageLog: MessageLog;

    private player: Player;
    private npcList: Actor[];

    private gameSize: { width: number, height: number };
    private displaySizing: DisplaySizing
    private mapSize: { width: number, height: number };
    private textLines = 4;
    private statusLinePosition: Point;
    private actionLogPosition: Point;
    private gameState: GameState;

    private pineapplePoint: Point3D;
    private foregroundColor = "white";
    private backgroundColor = "black";
    private maximumTurns = 360;
    private readonly successfulNumberOfBooks = 30;
    public readonly warper: Warper;

    constructor() {
        this.gameSize = { width: 75, height: 27 };
        this.displaySizing = new DisplaySizing(
            new Point(this.gameSize.width / 2, Math.ceil((this.gameSize.height- this.textLines) / 2)),
            new Point(0, 0),
            new Point(this.gameSize.width, this.gameSize.height - this.textLines - 2)
        );
        this.mapSize = { width: this.gameSize.width, height: this.gameSize.height - this.textLines - 1 };
        this.statusLinePosition = new Point(0, this.gameSize.height - this.textLines - 1);
        this.actionLogPosition = new Point(0, this.gameSize.height - this.textLines);

        this.display = new Display({
            width: this.gameSize.width,
            height: this.gameSize.height,
            fontSize: 20
        });
        document.body.appendChild(this.display.getContainer());

        this.gameState = new GameState();
        this.multimap = new Multimap(this);
        this.statusLine = new StatusLine(this, this.statusLinePosition, this.gameSize.width, { maxBoxes: this.maximumTurns });
        this.messageLog = new MessageLog(this, this.actionLogPosition, this.gameSize.width, this.textLines);
        this.warper = new Warper(this.multimap);

        this.initializeGame();
        this.mainLoop();
    }

    drawWithCheck(playerPosition: Point, displaySizing: DisplaySizing, position: Point, glyph: Glyph): void {

        const origin = playerPosition.reverse().plus(displaySizing.center)
        const drawnPosition = position.plus(origin);
        if (displaySizing.checkFits(drawnPosition)) {
            this.draw(drawnPosition, glyph);
        }

    }

    draw(position: Point, glyph: Glyph): void {
        let foreground = glyph.foregroundColor || this.foregroundColor;
        let background = glyph.backgroundColor || this.backgroundColor;
        this.display.draw(position.x, position.y, glyph.character, foreground, background);
    }

    drawText(position: Point, text: string, maxWidth?: number): void {
        this.display.drawText(position.x, position.y, text, maxWidth);
    }

    mapIsPassable(point: Point3D): boolean {
        return this.multimap.isPassable(point);
    }

    onLevelNavigable(level: number, unlockStrength: number): (x: number, y: number) => boolean {
        let map = this.multimap.getMap(level);
        return (x, y) => map.isNavigable(x, y, unlockStrength);
    }

    occupiedByEnemy(point: Point3D): boolean {
        for (let npc of this.npcList) {
            if (npc.position.equals(point)) {
                return true;
            }
        }
        return false;
    }

    getNpcOn(point: Point3D): Actor {
        for (let npc of this.npcList) {
            if (point.equals(npc.position)) {
                return npc;
            }
        }
        return null;
    }

    getPlayerPosition(): Point3D {
        return this.player.position;
    }

    endTheGameReachingBed() {
        this.messageLog.appendText("Try again with 'spacebar' or 'return'.");
        const books = this.statusLine.booksFound;
        const bookNumberColor = "#aaffbb";
        if (books >= this.successfulNumberOfBooks) {
            this.messageLog.appendText(`Congratulation! There will be definitely a clue about the %c{#d6dbff}Sightc%{} in those books!`);
        } else if (books >= this.successfulNumberOfBooks * 0.85) {
            this.messageLog.appendText(`Good work! It will probably help you ${this.player.getName()}'s next adventures.`);
        } else {
            const bookRef = books > 1? "those books": "this book";
            this.messageLog.appendText(`Yikes! There is only description of horrible monsters in ${bookRef}!`);
        }
        const bookRef = books > 1? "books": "book";
        this.messageLog.appendText(`You have reached safety of your bed with %c{${bookNumberColor}}${books} ${bookRef}%c{} to study.`);
        this.gameState.backToBed = true;

    }

    interact(actor: Actor, target: Point3D): boolean {

        let tile = this.multimap.getTile(target);
        if (tile == null)
            return false;

        return tile.interactWith(actor, this);
    }

    catchPlayer(actor: Actor): void {
        this.messageLog.appendText("Continue with 'spacebar' or 'return'.");
        this.messageLog.appendText(`Game over - you were captured by ${actor.getName()}!`);
        this.gameState.playerWasCaught = true;
    }

    getRandomTilePositions(type: TileType, quantity: number = 1): Point3D[] {
        return this.multimap.getRandomTilePositions(type, quantity);
    }

    getRandomTarget(filter: (tile: Tile) => boolean): Point3D {
        return this.multimap.getRandomTargets(filter, 1)[0];
    }

    private initializeGame(): void {
        this.display.clear();

        this.messageLog.clear();
        if (!this.gameState.isGameOver() || this.gameState.doRestartGame()) {
            this.resetStatusLine();
            this.writeHelpMessage();
        } else {
            this.statusLine.turns = 0;
        }
        this.gameState.reset();

        this.multimap.generateMultimap(this.mapSize.width, this.mapSize.height);

        this.createBeings();
        this.scheduler = new Scheduler.Simple();
        this.scheduler.add(this.player, true);
        for (let npc of this.npcList) {
            this.scheduler.add(npc, true);
        }

        this.drawPanel();
    }

    private async mainLoop(): Promise<any> {
        let actor: Actor;
        while (true) {
            actor = this.scheduler.next();
            if (!actor) {
                break;
            }
            console.log("loop tick")

            await actor.act();
            if (actor.type === ActorType.Player) {
                this.statusLine.turns += 1;
            }
            if (this.gameState.backToBed) {
                this.statusLine.night += 1;
            }

            this.drawPanel();

            if (this.gameState.isGameOver()) {
                await InputUtility.waitForInput(this.handleInput.bind(this));
                this.initializeGame();
            }
        }
    }

    private drawPanel(): void {
        this.display.clear();
        console.log(this.player)
        console.log(this.player.position)

        // somewhat confusing view of neighbour levels
        const levelsToShow = this.getLevelsToShow();
        for (let level of levelsToShow) {
            let levelMap = this.multimap.getMap(level);
            if (levelMap != null) {
                levelMap.draw(this.player.position.toPoint(), this.displaySizing);
            }
        }

        this.statusLine.draw();
        this.messageLog.draw();
        this.drawWithCheck(this.player.position.toPoint(), this.displaySizing, this.player.position.toPoint(), this.player.glyph);
        for (let enemy of this.npcList) {
            if (enemy.position == null) {
                console.warn(enemy.getName() + "did not spawned!");
                continue;
            }
            if (levelsToShow.indexOf(enemy.position.level) >= 0) {
                this.drawWithCheck(this.player.position.toPoint(), this.displaySizing, enemy.position.toPoint(), enemy.glyph);
            }
        }
    }

    private getLevelsToShow() {
        const result = [];
        if (this.player.position.x == 0) {
            if (this.player.position.y < 0) {
                result.push(this.player.position.level + 1)
            } else {
                result.push(this.player.position.level - 1)
            }
            result.push(this.player.position.level);
            return result;
        }

        if (this.player.position.y == 0) {
           return [this.player.position.level];
        }

        if (this.player.position.x * this.player.position.y < 0) {
            result.push(this.player.position.level + 1)
        } else {
            result.push(this.player.position.level - 1)
        }
        result.push(this.player.position.level);
        return result;

    }

    private handleInput(event: KeyboardEvent): boolean {
        let code = event.keyCode;
        return code === KEYS.VK_SPACE || code === KEYS.VK_RETURN;
    }

    private writeHelpMessage(): void {

        let dummyClair = new Clair(this, new Point3D(0, 0, 0), "Dummy", 0);
        let bookshelf = new Bookshelf(false);

        let helpMessage = [
            `Find some interesting books in library %c{${bookshelf.glyph.foregroundColor}}bookshelves%c{}.`,
            `Move with numpad, search %c{${bookshelf.glyph.foregroundColor}}bookshelves%c{} by walking into them'.`,
            `Interact with doors with CTRL, SHIFT, ALT or META + numpad`,
            `Watch out for %c{${dummyClair.glyph.foregroundColor}}Clairs%c{} in %c{${dangerColor}}restricted areas%c{}!`
        ];

        for (let index = helpMessage.length - 1; index >= 0; --index) {
            this.messageLog.appendText(helpMessage[index]);
        }
    }

    addLogMessage(message: string): void {
        this.messageLog.appendText(message);
    }

    getPositionRoom(position: Point3D): RoomProperties {
        let tile = this.multimap.getTile(position);
        if (tile instanceof RoomTile) {
            return tile.roomProps;
        }
        return null;
    }

    private createBeings(): void {
        this.npcList = [];
        this.spawnPlayer();
        this.spawnKirrith();
        this.createSendings();
        let clairs = this.createClairs();
        this.multimap.assignBedrooms(clairs);
    }

    private spawnPlayer() {
        this.player = new Player(this, null);
        this.multimap.assignBedrooms([this.player]);
        let spawnHelper = new PlayerSpawnHelper(this);
        this.player.position = spawnHelper.getPlayerSpawnPoint();
    }

    private spawnKirrith() {
        const fallbackPosition = this.getRandomTilePositions(TileType.Floor)[0];
        let kirrith = new KirrithPrimitive(this, fallbackPosition);
        this.multimap.assignBedrooms([kirrith]);
        const roomPosition = this.getRandomTarget(
            tile => (tile instanceof RoomTile) && tile.roomProps.occupant == kirrith);
        kirrith.position = roomPosition != null ? roomPosition : kirrith.position;
        this.npcList.push(kirrith);
    }


    private createSendings() {
        let nameHelper = new SendingsSpawnHelper();
        const numberOfSendings = nameHelper.maxCount();
        let positions = this.multimap.getRandomTargets(
            tile => (tile instanceof RoomTile && tile.roomProps.type == RoomType.LIBRARY),
            numberOfSendings);
        for (let i = 0; i < positions.length; i++) {
            let sending = new Sending(this, positions[i], nameHelper.getOne(i));
            this.npcList.push(sending);
        }
    }

    private createClairs() : Clair[] {

        let clairsList: Clair[] = [];
        let clairSpawnHelper = new ClairSpawnHelper();
        const numberOfClairs = clairSpawnHelper.maxClairs();
        let positions = this.multimap.getRandomTargets(
            tile => (tile instanceof RoomTile),
            numberOfClairs);
        for (let i = 0; i < positions.length; i++) {
            let [name, power] = clairSpawnHelper.getClair(i);
            let clair = new Clair(this, positions[i], name, power);
            clairsList.push(clair);
            this.npcList.push(clair);
        }
        return clairsList;
    }

    private resetStatusLine(): void {
        this.statusLine.reset();
        this.statusLine.turnsMax = this.maximumTurns;
    }

}