import { Component, OnInit, Output } from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import { Router } from '@angular/router';
import { CleaningService } from '../services/cleaning.service';
import { CleaningModel } from './cleaning.model';
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import { UserService } from '../services/user.service';
import {from, Observable, Subscription, throwError} from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { EventEmitter, Injectable } from '@angular/core';
import {catchError, tap} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable'
import jsPDF from 'jspdf';
import { ExportService } from '../services/export.service';
import { BusinessService } from '../services/business.service';
import { BusinessFile } from '../business/business-file.model';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FileUploadService } from '../services/file-upload.service';

export interface PeriodicElement {
  name: string; 
}

const ELEMENT_DATA: PeriodicElement[] = [
  {name: 'Hydrogen'},
  {name: 'Helium'}  
];


export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}

@Component({
  selector: 'app-cleaning-disinfection',
  templateUrl: './cleaning-disinfection.component.html',
  styleUrls: ['./cleaning-disinfection.component.css']
})
export class CleaningDisinfectionComponent implements OnInit {

  descriptionText : string = `Στο πεδίο “Αρχείο καθαρισμών” μπορείς να καταγράψεις/αρχειοθετήσεις/εκτυπώσεις το αρχείο τεκμηρίωσης καθαρισμών.`;

  displayedColumns: string[] = ['select',  'name'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);
  editDate: Timestamp;
  maxDate = new Date();
  fromDate: Timestamp;
  toDate: Timestamp;
  dataExport = [];

  form = this.fb.group({
    date: [null, Validators.required]
  });

  cleaningData: CleaningModel[];
  allChecked: boolean = false;
  date: Timestamp;
  showDateError: boolean = false;

  constructor(private fb: FormBuilder,
              private router: Router,
              private cleaningService: CleaningService,
              private userService: UserService,
              private afs: AngularFirestore,
              private exportService: ExportService,
              private fileUploadService: FileUploadService) {
  }

  ngOnInit() {
    this.getCleaningData();
  }

  getCleaningData() {
    this.cleaningService.getCleaningData()
      .subscribe(data => {
          this.cleaningData = data;
          this.allChecked = false;
      });
  }
  
  setAll(checked: boolean) {
    this.allChecked = checked;
    if (this.cleaningData == null) {
      return;
    }
    this.cleaningData.forEach(t => (t.checked = checked));
  }

  onSaveCleaningData() {
      if (!this.editDate) {
        this.showDateError = true;
        return;
      }
      this.showDateError = false;
      this.cleaningData.forEach(t => {
        if(t.docId === null || t.docId === undefined) {
          t.date = this.editDate;
          t.urid = this.userService.getUserId();
          t.docId = this.afs.createId();
          this.cleaningService.saveCleaningData(t, t.docId)
          .pipe(
            tap(() => {
              Swal.fire(
                'Επιτυχία!',
                'Τα δεδομένα αποθηκεύτηκαν επιτυχώς!',
                'success'
              )
            }),
            catchError(err => {
              Swal.fire({
                icon: 'error',
                title: 'Σφάλμα',
                text: 'Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά!'
              })
              return throwError(err)
            })
          ).subscribe();
        } else {
          this.cleaningService.updateCleaningData(t)
          .pipe(
            tap(() => {
              Swal.fire(
                'Επιτυχία!',
                'Τα δεδομένα ενημερώθηκαν επιτυχώς!',
                'success'
              )
            }),
            catchError(err => {
              Swal.fire({
                icon: 'error',
                title: 'Σφάλμα',
                text: 'Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά!'
              })
              return throwError(err)
            })
        ).subscribe();
        }
      })
  }

  getCleaningByDate(event: MatDatepickerInputEvent<Date>) {
    this.showDateError = false;
    this.editDate = Timestamp.fromDate(event.target.value);
    this.cleaningService.getCleaningByDate(this.editDate)
    .subscribe(cl => {
      if(cl.length > 0) {
        this.cleaningData = cl;
      } else {
        this.getCleaningData();
      }
    });
  }


  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'cleaning-files');
    this.fileUploadService.getFilesByCategory('cleaning-files'); 
  }


  setDateFrom(event: MatDatepickerInputEvent<Date>) {
    this.fromDate = Timestamp.fromDate(event.target.value)
  }

  setDateTo(event: MatDatepickerInputEvent<Date>) {
    this.toDate = Timestamp.fromDate(event.target.value);
  }

  export() {
    this.exportService.exportCleaning(this.fromDate, this.toDate)
  }


 
}