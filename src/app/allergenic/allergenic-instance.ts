import { AllergenicInstanceInfo } from "./allergenic-instance-info";

export class AllergenicInstance {
    name: string
    isSelected: boolean;
    contains: AllergenicInstanceInfo[] = [];
    ingredients: AllergenicInstanceInfo[] = [];
}