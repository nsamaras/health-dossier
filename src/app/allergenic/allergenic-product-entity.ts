
export class AllergenicProductEntity {
    urid: string;
    // allergenics: any;
    contains: {  [key: string]: boolean; }[] = [];
    ingredients: {   [key: string]: boolean; }[] = [];
}