import {Actor} from "./actor/actor";
import {Multimap} from "./multimap";
import {WarpTile} from "./tile/warptile";
import {Point3D} from "./point3d";
import {Game} from "./game";
import {Player} from "./actor/player";

export class Warper {

    private messageSpamCounter = 0;
    private readonly spamLimit = 8;

    constructor(private multimap: Multimap, private game: Game) {

    }

    tryActorLevelWarp(actor: Actor): void{

        this.handleSpam(actor);

        let tile = this.multimap.getTile(actor.position);
        if (tile == null || !(tile instanceof WarpTile)) {
           return;
        }

        this.informPlayer(actor, tile);
        actor.position = new Point3D(tile.targetLevel, actor.position.x, actor.position.y)
    }

    private handleSpam(actor: Actor) {
        if (actor instanceof Player) {
            this.messageSpamCounter++;
        }
    }

    private informPlayer(actor: Actor, tile: WarpTile) {
        if (!(actor instanceof Player)) {
            return;
        }

        if (this.messageSpamCounter > this.spamLimit) {
            this.messageSpamCounter = 0;
            const directionStr = actor.position.level < tile.targetLevel ? "upward": "downward";
            this.game.addLogMessage(`You're spiraling ${directionStr}.`);
        }
    }

    findTargetThroughWarps(actor: Actor, target: Point3D): Point3D {

        if (actor.position == null)
            return null;

        if (actor.position.level == target.level) {
            return target;
        }

        const dir = Math.sign(target.level - actor.position.level);

        return this.multimap.getRandomWarpFromTo(actor.position.level, actor.position.level + dir);
    }


}