import firebase from 'firebase/compat/app';
import { CriteriaEvaluation } from './supplier-evaluation/criteria-evaluation-model';
import Timestamp = firebase.firestore.Timestamp;

export class SupplierModel {
    id: number;
    urid: string;
    name: string;
    type: string;
    docId: string;
    comments: string;
    totalScore: number = 0;
    newEvaluationDate: string;
    previousEvaluationDate: string;
    criteriaEvaluation: CriteriaEvaluation[];
}