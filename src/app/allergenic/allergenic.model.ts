import firebase from 'firebase/compat/app';

export class AllergenicInstanceModel {
    name: string;
    id: string;
    seqOrder: number;
    checkedContains: boolean = false; 
    checkedIngredients: boolean = false;
    urid: string;
    docId: string;
}