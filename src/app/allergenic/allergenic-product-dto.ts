import { AllergenicInstance } from "./allergenic-instance";

export class AllergenicProductDTo {
    urid: string;
    contains: AllergenicInstance[] = [];
    ingredients: AllergenicInstance[] = [];
}