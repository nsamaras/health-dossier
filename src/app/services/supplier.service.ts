import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { from, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import Swal from "sweetalert2";
import { Menu } from "../model/menu";
import { SupplierEvaluationCriteria } from "../suppliers/supplier-evaluation/supplier-evaluation-criteria";
import { SupplierFile } from "../suppliers/supplier-file.model";
import { SupplierTypeModel } from "../suppliers/supplier-type.model";
import { SupplierModel } from "../suppliers/supplier.model";
import { convertSnaps } from "./db-utils";
import { UserService } from "./user.service";
import { CriteriaEvaluation } from "../suppliers/supplier-evaluation/criteria-evaluation-model";

@Injectable({
    providedIn: "root"
  })
  export class SupplierService {

  filesChanged = new Subject<SupplierFile[]>();    
  private files: SupplierFile []  = [];
  fileSelected = new Subject<SupplierFile>();

  newDataSource = [
    {name: 'Ποιότητα Προϊόντων', score: 0, percentage: 20, finalScore: ''},
    {name: 'Πιστοποίηση/ Εφαρμογή HACCP', score: 0, percentage: 20, finalScore: ''},
    {name: 'Αναλύσεις προϊόντων', score: 0, percentage: 20, finalScore: ''},
    {name: 'Συσκευασία προϊόντων', score: 0, percentage: 10, finalScore: ''},
    {name: 'Διαθεσιμότητα Προϊόντων (Επαρκής Κάλυψη)', score: 0, percentage: 10, finalScore: ''},
    {name: 'Τιμές', score: 0, percentage: 10, finalScore: ''},
    {name: 'Χρόνος Παράδοσης', score: 0, percentage: 10, finalScore: ''},
  ];

  constructor(private db: AngularFirestore,
    private userService: UserService) { }

  getBusinessFiles() {
      return this.files.slice(); 
  }

  loadByCategory(category: string): Observable <Menu[]> {
      return this.db.collection("menu",
                   ref => ref.where("category", "==", category) 
                   .orderBy("seqNo"))
                   .get()
                   .pipe(
                       map(result => convertSnaps<Menu>(result))
                   );
  }

  loadHeadersByMenuId(id: any) {
          return this.db.collection(               
              '/menu/'+id+'/headers',
              ref => ref.orderBy("seqNo"))
              .get()
              .pipe(
                  map(result => convertSnaps<SupplierFile>(result))
              );
  }

  loadSuppliersTypes() {
    return this.db.collection(               
        '/supplier-types',
        ref => ref.orderBy("seqNo"))
        .get()
        .pipe(
            map(result => convertSnaps<SupplierTypeModel>(result))
        );
  }

  loadSuppliersByUrid() {
    var urid = this.userService.getUserId();
    return this.db.collection('suppliers/')
            .doc(`${urid}`)
            .collection('SUPPLIERS',
            ref => ref
            .where("urid", "==", urid)
            .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<SupplierTypeModel>(result))
           )
  }
  
  loadSupplierCriteria() : Observable<SupplierEvaluationCriteria[]>{
    return this.db.collection('supplier-evaluation-criteria',
             ref => ref
             .orderBy("seqNo"))
             .get()
             .pipe(
               map(result => convertSnaps<SupplierEvaluationCriteria>(result))
             )
  }

  getSupplierCriteriaByUrid() {
    const urid = this.userService.getUserId();
   return this.db.doc("/suppliers-evaluation-data/"+urid).ref.get()
  }

  saveSupplier(newSupplier: Partial<SupplierModel>, docId: string) {
    var urid = this.userService.getUserId();
    // var id = this.db.createId();
    if(urid != undefined) {
        return  from(this.db.collection('suppliers/')
        .doc(`${urid}`)
        .collection('SUPPLIERS')
        .doc(`${docId}`)
        .set(newSupplier))
                .pipe(
                    map(res => {
                        return {
                          ...newSupplier
                        }
                }))
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Παρακαλώ κάντε login'            
          })
    }
    
  }

  onDeleteSupplierFromProfile(supplier: any) {
    var urid = this.userService.getUserId();
    return  from(this.db.collection('suppliers/').doc(`${urid}`).collection('SUPPLIERS').doc(`${supplier.docId}`).delete());
  }

  updateSupplierFromProfile(docId: string, changes: Partial<SupplierModel>) : Observable<any> {
    var urid = this.userService.getUserId();
    return from(this.db.collection('suppliers/').doc(`${urid}`).collection('SUPPLIERS').doc(`${docId}`).update(changes));
  }

  instatiateCriteriaEvaluation(): CriteriaEvaluation[] {
    const criteriaEvaluations:  CriteriaEvaluation[] = [];    
    for(let x=0; x<this.newDataSource.length; x++) {
      const criteria = new CriteriaEvaluation();
      criteria.name = this.newDataSource[x].name
      criteria.score = this.newDataSource[x].score
      criteria.percentage = this.newDataSource[x].percentage;
      criteriaEvaluations.push(criteria);
    }
    return criteriaEvaluations;
  }

}