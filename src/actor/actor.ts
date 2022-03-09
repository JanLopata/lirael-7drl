import {Glyph} from "../glyph";
import {Point3D} from "../point3d";

export const enum ActorType {
    Player,
    Pedro,
    TinyPedro,
    Sending,
    Clair
}

export interface Actor {
    position: Point3D;
    glyph: Glyph;
    type: ActorType;

    act(): Promise<any>;
}