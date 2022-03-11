import {Display, KEYS, RNG, Scheduler} from "rot-js/lib/index";
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
import {Door} from "./tile/door";
import {Sending} from "./actor/sending";
import {dangerColor, RoomTile} from "./tile/room_tile";
import {RoomType} from "./room/room_decorator";
import {Clair} from "./actor/clair";
import {RoomProperties} from "./room/room_property";
import {ClairSpawnHelper} from "./actor/helpers/clair_spawn_helper";
import {SendingsSpawnHelper} from "./actor/helpers/sendings_spawn_helper";
import {Bookshelf} from "./tile/bookshelf";
import {PlayerSpawnHelper} from "./actor/helpers/player_spawn_helper";

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
    private maximumBoxes = 10;
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
        this.statusLine = new StatusLine(this, this.statusLinePosition, this.gameSize.width, { maxBoxes: this.maximumBoxes });
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

    onLevelPassable(level: number): (x: number, y: number) => boolean {
        let map = this.multimap.getMap(level);
        if (map == null) {
            console.warn("no map found for level " + level)
            return (a, b) => false;
        }
        return (x, y) => map.isPassable(x, y);
    }

    onLevelNavigable(level: number, unlockStrength: number): (x: number, y: number) => boolean {
        let map = this.multimap.getMap(level);
        return (x, y) => map.isNavigable(x, y, unlockStrength);
    }

    occupiedByEnemy(point: Point3D): boolean {
        for (let enemy of this.npcList) {
            if (enemy.position.equals(point)) {
                return true;
            }
        }
        return false;
    }

    getPlayerPosition(): Point3D {
        return this.player.position;
    }

    checkBox(level:number, x: number, y: number): void {
        switch (this.multimap.getTileType(level, x, y)) {
            case Tile.box.type:
                this.multimap.setTile(level, x, y, Tile.searchedBox);
                this.statusLine.boxes += 1;
                if (this.pineapplePoint.x == x && this.pineapplePoint.y == y) {
                    this.messageLog.appendText("Continue with 'spacebar' or 'return'.");
                    this.messageLog.appendText("Hooray! You found a pineapple.");
                    this.gameState.foundPineapple = true;
                } else {
                    this.messageLog.appendText("This box is empty.");
                }
                break;
            case Tile.searchedBox.type:
                this.multimap.setTile(level, x, y, Tile.destroyedBox);
                this.messageLog.appendText("You destroy this box!");
                break;
            case Tile.destroyedBox.type:
                this.messageLog.appendText("This box is already destroyed.");
                break;
            default:
                this.messageLog.appendText("There is no box here!");
                break;
        }
    }

    destroyBox(actor: Actor, level: number, x: number, y: number): void {
        switch (this.multimap.getTileType(level, x, y)) {
            case TileType.Box:
            case TileType.SearchedBox:
                this.multimap.setTile(level, x, y, Tile.destroyedBox);
                if (this.pineapplePoint.x == x && this.pineapplePoint.y == y) {
                    this.messageLog.appendText("Continue with 'spacebar' or 'return'.");
                    this.messageLog.appendText(`Game over - ${actor.getName()} destroyed the box with the pineapple.`);
                    this.gameState.pineappleWasDestroyed = true;
                } else {
                    this.messageLog.appendText(`${actor.getName()} destroyed a box.`);
                }
                break;
            case TileType.DestroyedBox:
                this.messageLog.appendText("This box is already destroyed.");
                break;
            default:
                this.messageLog.appendText("There is no box here!");
                break;
        }
    }

    isDoorOn(target: Point3D): boolean {
        let tile = this.multimap.getTile(target);
        return tile instanceof Door;
    }

    isBookshelfOn(target: Point3D): boolean {
        let tile = this.multimap.getTile(target);
        return tile instanceof Bookshelf;
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
            this.statusLine.boxes = 0;
        }
        this.gameState.reset();

        this.multimap.generateMultimap(this.mapSize.width, this.mapSize.height);
        this.generateBoxes();

        this.createBeings();
        this.scheduler = new Scheduler.Simple();
        this.scheduler.add(this.player, true);
        for (let enemy of this.npcList) {
            this.scheduler.add(enemy, true);
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
            if (this.gameState.foundPineapple) {
                this.statusLine.pineapples += 1;
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
            `Move with numpad, search %c{${bookshelf.glyph.foregroundColor}}bookshelf%c{} by walking into them'.`,
            `Interact with doors with CTRL + numpad, or ALT + numpad key`,
            `Watch out for %c{${dummyClair.glyph.foregroundColor}}Clairs%c{} on %c{${dangerColor}}restricted areas%c{}!`
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

    private generateBoxes(): void {
        let positions = this.multimap.getRandomTilePositions(TileType.Floor, this.maximumBoxes);
        for (let position of positions) {
            this.multimap.setTile(position.level, position.x, position.y, Tile.box);
        }
        this.pineapplePoint = positions[0];
    }

    private createBeings(): void {
        this.npcList = [];
        this.spawnPlayer();
        this.createSendings();
        this.createClairs();
    }

    private spawnPlayer() {
        let spawnHelper = new PlayerSpawnHelper(this);
        let position = spawnHelper.getPlayerSpawnPoint();
        this.player = new Player(this, position);
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

    private createClairs() {
        let clairSpawnHelper = new ClairSpawnHelper();
        const numberOfClairs = clairSpawnHelper.maxClairs();
        let positions = this.multimap.getRandomTargets(
            tile => (tile instanceof RoomTile),
            numberOfClairs);
        for (let i = 0; i < positions.length; i++) {
            let [name, power] = clairSpawnHelper.getClair(i);
            this.npcList.push(new Clair(this, positions[i], name, power));
        }
    }

    private resetStatusLine(): void {
        this.statusLine.reset();
        this.statusLine.maxBoxes = this.maximumBoxes;
    }

    sameLevelPointOrNull(level: number, point: Point3D): Point {
        if (point.level != level) {
            return null;
        }
        return point.toPoint();
    }

}