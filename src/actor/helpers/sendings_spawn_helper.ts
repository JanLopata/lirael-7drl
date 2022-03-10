import {RNG} from "rot-js";

const sendingNames = ['Snarky', 'Old timey', 'Charterix', 'Randy', 'Rumbly', 'Pebble', 'Norman', 'Diamond']

export class SendingsSpawnHelper {

    private nameList: string[] = [];

    constructor() {
        for (let i = 0; i < sendingNames.length; i++) {
            this.nameList.push(sendingNames[i]);
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