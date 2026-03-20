import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import {ThemePalette} from '@angular/material/core';

export class CleaningModel {
    name: string;
    id: string;
    seqOrder: number;
    checked: boolean = false; 
    urid: string;
    date: Timestamp;
    docId: string;
}