import { CriteriaEvaluation } from "./criteria-evaluation-model";

export class SupplierEvaluationModel {
    public name: string;
    public type: string;
    public comments: string;
    public criteriaEvaluation: CriteriaEvaluation[];
}