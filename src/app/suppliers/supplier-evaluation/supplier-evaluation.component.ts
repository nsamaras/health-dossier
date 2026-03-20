import { Component, OnInit, ViewChild } from '@angular/core';
import { SupplierService } from 'src/app/services/supplier.service';
import { SupplierModel } from '../supplier.model';
import { SupplierEvaluationCriteria } from './supplier-evaluation-criteria';
import { SupplierEvaluationModel } from './supplier-evaluation-model';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CriteriaEvaluation } from './criteria-evaluation-model';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { MatAccordion } from '@angular/material/expansion';
import { FormBuilder, FormGroup } from '@angular/forms';
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import {formatDate} from '@angular/common';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ExportService } from 'src/app/services/export.service';

interface Doc {
  id: number;
  data: SupplierEvaluationModel;
}

@Component({
  selector: 'app-supplier-evaluation',
  templateUrl: './supplier-evaluation.component.html',
  styleUrls: ['./supplier-evaluation.component.css']
})
export class SupplierEvaluationComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  displayedColumns: string[] = ['name', 'score', 'percentage', 'finalScore'];
  displayedRoolsColumns: string[] = ['column_1', 'column_2', 'column_3'];

  // newDataSource = [
  //   {name: 'Ποιότητα Προϊόντων', score: 0, percentage: 20, finalScore: ''},
  //   {name: 'Πιστοποίηση/ Εφαρμογή HACCP', score: 0, percentage: 20, finalScore: ''},
  //   {name: 'Αναλύσεις προϊόντων', score: 0, percentage: 20, finalScore: ''},
  //   {name: 'Συσκευασία προϊόντων', score: 0, percentage: 10, finalScore: ''},
  //   {name: 'Διαθεσιμότητα Προϊόντων (Επαρκής Κάλυψη)', score: 0, percentage: 10, finalScore: ''},
  //   {name: 'Τιμές', score: 0, percentage: 10, finalScore: ''},
  //   {name: 'Χρόνος Παράδοσης', score: 0, percentage: 10, finalScore: ''},
  // ];

  dataSource: CriteriaEvaluation[];

  dataRoolsSource = [
    {column_1: 'από 351 έως 500', column_2: 'Α', column_3: 'ΠΡΟΤΙΜΗΤΕΟΣ'},
    {column_1: 'από 251 έως 350', column_2: 'Β', column_3: 'ΑΠΟΔΕΚΤΟΣ'},
    {column_1: 'από 151 έως 250', column_2: 'Γ', column_3: 'ΑΠΟΔΕΚΤΟΣ ΥΠΟ ΣΥΝΘΗΚΗ'},
    {column_1: 'από 00 έως 150', column_2: 'Δ', column_3: 'ΑΠΟΡΡΙΠΤΕΟΣ'},
  ];

  dropdownOptions = [
    {value: '0', score: 0},
    {value: '1', score: 1},
    {value: '2', score: 2},
    {value: '3', score: 3},
    {value: '4', score: 4},
    {value: '5', score: 5}
  ];

  suppliers: SupplierModel[] = [];
  supplierCriteria: SupplierEvaluationCriteria[];
  suppliersData: any;
  form: FormGroup;

  constructor(private supplierService: SupplierService,
    private fb: FormBuilder, private exportService: ExportService) { }

  ngOnInit(): void {
    this.getSupplierCriteriaByUrid();
    this.getSupplierCriteria();
  }
  
  getSupplierCriteriaByUrid() {
    this.supplierService.loadSuppliersByUrid().subscribe(results => {
      this.suppliersData = results;
      for (let x = 0; x < this.suppliersData.length; x++) {
        let supplier = new SupplierModel();
        supplier.name = this.suppliersData[x].name;
        supplier.type = this.suppliersData[x].type;
        supplier.comments = this.suppliersData[x].comments;
        if(this.suppliersData[x].criteriaEvaluation == null || 
          this.suppliersData[x].criteriaEvaluation == undefined) {
            supplier.criteriaEvaluation = this.supplierService.instatiateCriteriaEvaluation();
        } else {
          supplier.criteriaEvaluation = this.suppliersData[x].criteriaEvaluation;
        }
        supplier.id = this.suppliersData[x].id;
        supplier.docId =  this.suppliersData[x].docId;
        supplier.urid = this.suppliersData[x].urid;
        supplier.previousEvaluationDate = this.suppliersData[x].newEvaluationDate;
        supplier.totalScore = isNaN(this.suppliersData[x].totalScore) ? 0 : this.suppliersData[x].totalScore;        
        this.suppliers.push(supplier);        
      }
      });
  }

  getSupplierCriteria() {
    this.supplierCriteria = [];
    this.supplierService.loadSupplierCriteria().pipe()
    .subscribe(data => { 
      data.forEach(d => {
        const supplierCriteria = new SupplierEvaluationCriteria();
        supplierCriteria.seqNo = d.seqNo;
        supplierCriteria.name = d.name;
        this.supplierCriteria.push(supplierCriteria);
      })
    })
  }

  mapDocToTypeScriptObject(doc: any): Doc {
    const tsObject: Doc = {
        id: doc.id,
        data: doc.data(),
    };
    return tsObject;
  }

  onSelectionScore(event: MatSelectChange,  element: any, selectedSupplier: SupplierModel) {
    this.suppliers.forEach(s => {
      if(s.id === selectedSupplier.id) {
        s.criteriaEvaluation.forEach(criteriaEvaluation => {
          if(criteriaEvaluation.name === element.name) {
            criteriaEvaluation.finalScore = event.value * criteriaEvaluation.percentage;
            criteriaEvaluation.score = event.value;
          }
        })
      }          
    })   
    let totalScore = 0;
    selectedSupplier.criteriaEvaluation.forEach(ce => {
      if(ce.finalScore !== undefined) {
        totalScore = totalScore + ce.finalScore;
      }      
    })
    selectedSupplier.totalScore = totalScore;
  }

  onSave(supplierMode: SupplierModel) {
    supplierMode.previousEvaluationDate = supplierMode.newEvaluationDate;
    var obj = JSON.parse(JSON.stringify(supplierMode));
    this.supplierService.updateSupplierFromProfile(supplierMode.docId, obj).pipe(
      tap( () => {
        Swal.fire('Ο προμηθευτής ανανεώθηκε με επιτυχία', 'success');
      }),
      catchError(error => {
        console.log("error");
        Swal.fire('Ο προμηθευτής ανανεώθηκε με επιτυχία', 'info');
        return throwError(error);
      })
    ).subscribe();
  }

  setEvaluationDate(event: MatDatepickerInputEvent<Date>, selectedSupplier: SupplierModel) {
    selectedSupplier.newEvaluationDate = this.transform(Timestamp.fromDate(event.target.value), "dd/MM/yyyy");
  }

  transform(timestamp: Timestamp, format?: string): string {
    if (!timestamp?.toDate) { 
      return;
    }
    return formatDate(timestamp.toDate(), format || 'medium', 'en-us');
  }

  export() {
    this.exportService.exportSuppliersEvaluation();
  }
}
