import { AllergenicProductInstance } from './allergenic-doc.model';
import { AllergenicInstanceModel } from './allergenic.model';

export class AllergenicProductModel {
    productName: string;
    urid: string;
    allergenicData: AllergenicInstanceModel[];
    contains: {  [key: string]: boolean; }[] = [];
    ingredients: {   [key: string]: boolean; }[] = [];
}