import {Display, KEYS, RNG, Scheduler} from "rot-js/lib/index";
import Simple from "rot-js/lib/scheduler/simple";

import {Player} from "./player";
import {Point} from "./point";
import {Glyph} from "./glyph";
import {Actor, ActorType} from "./actor";
import {Pedro} from "./pedro";
import {GameState} from "./game-state";
import {StatusLine} from "./status-line";
import {MessageLog} from "./message-log";
import {InputUtility} from "./input-utility";
import {Tile, TileType} from "./tile";
import {TinyPedro} from "./tiny-pedro";
import {DisplaySizing} from "./display_sizing";
import {Multimap} from "./multimap";
import {Point3D} from "./point3d";

export class Game {
    private display: Display;
    private scheduler: Simple;
    private multimap: Multimap;
    private statusLine: StatusLine;
    private messageLog: MessageLog;

    private player: Player;
    private enemies: Actor[];

    private gameSize: { width: number, height: number };
    private displaySizing: DisplaySizing
    private mapSize: { width: number, height: number };
    private statusLinePosition: Point;
    private actionLogPosition: Point;
    private gameState: GameState;

    private pineapplePoint: Point3D;
    private pedroColor: string;
    private foregroundColor = "white";
    private backgroundColor = "black";
    private maximumBoxes = 10;

    constructor() {
        this.gameSize = { width: 75, height: 25 };
        this.displaySizing = new DisplaySizing(
            new Point(this.gameSize.width / 2, this.gameSize.height / 2),
            new Point(0, 0),
            new Point(this.gameSize.width, this.gameSize.height - 5)
        );
        this.mapSize = { width: this.gameSize.width, height: this.gameSize.height - 4 };
        this.statusLinePosition = new Point(0, this.gameSize.height - 4);
        this.actionLogPosition = new Point(0, this.gameSize.height - 3);

        this.display = new Display({
            width: this.gameSize.width,
            height: this.gameSize.height,
            fontSize: 20
        });
        document.body.appendChild(this.display.getContainer());

        this.gameState = new GameState();
        this.multimap = new Multimap(this);
        this.statusLine = new StatusLine(this, this.statusLinePosition, this.gameSize.width, { maxBoxes: this.maximumBoxes });
        this.messageLog = new MessageLog(this, this.actionLogPosition, this.gameSize.width, 3);
        this.pedroColor = new Pedro(this, new Point3D(0, 0, 0)).glyph.foregroundColor;

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

    mapIsPassable(level: number, x: number, y: number): boolean {
        return this.multimap.isPassable(level, x, y);
    }

    onLevelPassable(level: number): (x: number, y: number) => boolean {
        let map = this.multimap.getMap(level);
        if (map == null) {
            console.warn("no map found for level " + level)
            return (a, b) => false;
        }
        return (x, y) => map.isPassable(x, y);
    }

    occupiedByEnemy(x: number, y: number): boolean {
        for (let enemy of this.enemies) {
            if (enemy.position.x == x && enemy.position.y == y) {
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
                    this.messageLog.appendText(`Game over - ${this.getActorName(actor)} destroyed the box with the pineapple.`);
                    this.gameState.pineappleWasDestroyed = true;
                } else {
                    this.messageLog.appendText(`${this.getActorName(actor)} destroyed a box.`);
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

    catchPlayer(actor: Actor): void {
        this.messageLog.appendText("Continue with 'spacebar' or 'return'.");
        this.messageLog.appendText(`Game over - you were captured by ${this.getActorName(actor)}!`);
        this.gameState.playerWasCaught = true;
    }

    getRandomTilePositions(type: TileType, quantity: number = 1): Point3D[] {
        return this.multimap.getRandomTilePositions(type, quantity);
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
        for (let enemy of this.enemies) {
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
        this.multimap.getMap(this.player.position.level).draw(this.player.position.toPoint(), this.displaySizing);
        this.statusLine.draw();
        this.messageLog.draw();
        this.drawWithCheck(this.player.position.toPoint(), this.displaySizing, this.player.position.toPoint(), this.player.glyph);
        for (let enemy of this.enemies) {
            this.drawWithCheck(this.player.position.toPoint(), this.displaySizing, enemy.position.toPoint(), enemy.glyph);
        }
    }

    private handleInput(event: KeyboardEvent): boolean {
        let code = event.keyCode;
        return code === KEYS.VK_SPACE || code === KEYS.VK_RETURN;
    }

    private writeHelpMessage(): void {
        let helpMessage = [
            `Find the pineapple in one of the %c{${Tile.box.glyph.foregroundColor}}boxes%c{}.`,
            `Move with numpad, search %c{${Tile.box.glyph.foregroundColor}}box%c{} with 'spacebar' or 'return'.`,
            `Watch out for %c{${this.pedroColor}}Pedro%c{}!`
        ];

        for (let index = helpMessage.length - 1; index >= 0; --index) {
            this.messageLog.appendText(helpMessage[index]);
        }
    }

    private getActorName(actor: Actor): string {
        switch (actor.type) {
            case ActorType.Player:
                return `Player`;
            case ActorType.Pedro:
                return `%c{${actor.glyph.foregroundColor}}Pedro%c{}`;
            case ActorType.TinyPedro:
                return `%c{${actor.glyph.foregroundColor}}Pedros son%c{}`;
            default:
                return "unknown actor";
        }
    }

    private generateBoxes(): void {
        let positions = this.multimap.getRandomTilePositions(TileType.Floor, this.maximumBoxes);
        for (let position of positions) {
            this.multimap.setTile(position.level, position.x, position.y, Tile.box);
        }
        this.pineapplePoint = positions[0];
    }

    private createBeings(): void {
        let numberOfEnemies = 1 + Math.floor(this.statusLine.pineapples / 3.0);
        this.enemies = [];
        let positions = this.multimap.getRandomTilePositions(TileType.Floor, 1 + numberOfEnemies);
        this.player = new Player(this, positions.splice(0, 1)[0]);
        for (let position of positions) {
            if (this.statusLine.pineapples < 1 || RNG.getUniform() < 0.5) {
                this.enemies.push(new Pedro(this, position));
            } else {
                this.enemies.push(new TinyPedro(this, position));
            }
        }
        // console.log(this.enemies)
        console.log(positions)
        console.log(this.player.position)
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