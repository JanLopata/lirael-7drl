import {RNG} from "rot-js";

const clairsMap = {
    "Sanar": 4,
    "Ryelle": 4,
    "Sohrae": 4,
    "Annisele": 1,
    "Small Jasell": 3,
    "Vancelle": 5,
    "Ness": 4,
    "Roslin": 3,
    "Imshi": 2,
    "Lealla": 3,
    "Kimmeru": 2,
}


export class ClairSpawnHelper {

    private clairList: string[] = [];

    constructor() {
        for (let clairName in clairsMap) {
            this.clairList.push(clairName);
        }
        RNG.shuffle(this.clairList);
    }

    maxClairs(): number {
        return this.clairList.length;
    }

    getClair(index: number): [string, number] {
        let name = this.clairList[index];
        return [name, clairsMap[name]];
    }


}