import {RNG} from "rot-js";

const sendingNames = ['Snarky', 'Old timey', 'Charterix', 'Randy', 'Rumbly', 'Pebble', 'Norman', 'Diamond']

export class SendingsSpawnHelper {

    private nameList: string[] = [];

    constructor() {
        for (let name in sendingNames) {
            this.nameList.push(name);
        }
        RNG.shuffle(this.nameList);
    }

    maxCount(): number {
        return this.nameList.length;
    }

    getOne(index: number): string {
        return this.nameList[index];
    }


}