import {Actor} from "./actor/actor";
import {Multimap} from "./multimap";
import {WarpTile} from "./tile/warptile";
import {Point3D} from "./point3d";

export class Warper {

    constructor(private multimap: Multimap) {

    }


    tryActorLevelWarp(actor: Actor): boolean {

        let tile = this.multimap.getTile(actor.position.level, actor.position.x, actor.position.y);
        if (tile == null || !(tile instanceof WarpTile)) {
           return false;
        }

        actor.position = new Point3D(tile.targetLevel, actor.position.x, actor.position.y)
        console.log("Actor " + actor.type + " warped to level " + actor.position.level);
    }

    findTargetThroughWarps(actor: Actor, target: Point3D): Point3D {

        if (actor.position.level == target.level) {
            return target;
        }

        const dir = Math.sign(target.level - actor.position.level);

        return this.multimap.getRandomWarpFromTo(actor.position.level, actor.position.level + dir);
    }


}