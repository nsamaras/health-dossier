import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;

export class TemperatureModel {
    id: number;
    urid: string;
    name: string;
    category: string;
    temperatureMorning: string;
    temperatureAfternoon: string;
    temperature: string;
    date: Timestamp;
    docId: string;
}