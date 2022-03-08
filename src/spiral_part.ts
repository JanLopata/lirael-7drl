import {Map} from "./map"
import {Tile} from "./tile";
import {Multimap} from "./multimap";
import {WarpTile} from "./warptile";

export class SpiralPart {

    private readonly level: number;
    readonly orientedLeft: boolean;
    private readonly insideDiameter: number;
    readonly outsideDiameter: number;

    constructor(level: number, insideDiameter: number, outsideDiameter: number, left: boolean) {
        this.level = level;
        this.outsideDiameter = outsideDiameter;
        this.insideDiameter = insideDiameter;
        this.orientedLeft = left;
    }

    public imprintToMap(map: Map) {

        const outDiamSquared = this.outsideDiameter * this.outsideDiameter;
        const inDiamSquared = this.insideDiameter * this.insideDiameter;

        const left = this.orientedLeft ? -this.outsideDiameter : 0;
        const right = this.orientedLeft ? -1 : this.outsideDiameter;

        for (let i = left; i <= right; i++) {
            for (let j = -this.outsideDiameter; j < this.outsideDiameter; j++) {
                let localR = i * i + j * j;
                if (inDiamSquared <= localR && localR <= outDiamSquared) {
                    map.setTile(i, j, Tile.floor);
                }
            }
        }
    }

    public connect(multimap: Multimap) {

        const connectionX = this.orientedLeft ? 0 : -1;
        const levelDirection = this.orientedLeft ? -1 : 1;

        const thisLevelMap = multimap.getMap(this.level);
        // top
        let topTargetMap = multimap.getMap(this.level + levelDirection);
        if (topTargetMap != null) {

            const warpTile = new WarpTile(this.level + levelDirection)
            for (let j = -this.outsideDiameter - 2; j <= 1; j++) {
                if (topTargetMap.isPassable(connectionX, j)) {
                    thisLevelMap.setTile(connectionX, j, warpTile);
                }
            }
        }

        // bottom
        let bottomTargetMap = multimap.getMap(this.level - levelDirection);
        if (bottomTargetMap != null) {
            const warpTile = new WarpTile(this.level - levelDirection)
            for (let j = 1; j <= this.outsideDiameter + 2; j++) {
                if (bottomTargetMap.isPassable(connectionX, j)) {
                    thisLevelMap.setTile(connectionX, j, warpTile);
                }
            }
        }

    }

}