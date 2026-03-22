import { Component, ElementRef, EventEmitter, NgZone, OnInit, AfterViewInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { TemperatureService } from '../services/temperature.service';
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import { TemperatureModel } from './temperature.model';
import { UserService } from '../services/user.service';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { AddTemperatureComponent } from './add-temperature/add-temperature.component';
import { EditTemperatureComponent } from './edit-temperature/edit-temperature.component';
import {catchError, tap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import {MatAccordion} from '@angular/material/expansion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable'
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { AddRowTemperatureComponent } from './add-temperature/add-row-temperature/add-row-temperature.component';
import { ExportService } from '../services/export.service';


import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-temperature',
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class TemperatureComponent implements OnInit, AfterViewInit {

  descriptionText : string = `Στο πεδίο “Αρχείο παρακολούθησης θερμοκρασιών” μπορείς να καταγράψεις/αρχειοθετήσεις/εκτυπώσεις το αρχείο τεκμηρίωσης θερμοκρασιών`;
 
  temperatureFridgeOptions: number[] = [0, 1, 2, 3, 4, 5, 6];
  temperatureFreezerOptions: number[] = [-18, -19, -20, -21, -22, -23];
  temperatureHotsOptions: number[] = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
  temperatureCookedOptions: number[] = [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90];


  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('content') content:ElementRef;
  @ViewChild('f') fridgeForm: NgForm;
  @ViewChild('fridgePaginator') fridgePaginator: MatPaginator;
  @ViewChild('freezerPaginator') freezerPaginator: MatPaginator;
  @ViewChild('hotsPaginator') hotsPaginator: MatPaginator;
  @ViewChild('cookedPaginator') cookedPaginator: MatPaginator;
  displayedColumns: string[] = ['name', 'temperatureMorning', 'temperatureAfternoon', 'delete'];
  displayedColumnsOneTemperature: string[] = ['name', 'temperature', 'delete'];
  fridgeDataSource : TemperatureModel[] = []; 
  freezerDataSource : TemperatureModel[] = [];
  hotsDataSource : TemperatureModel[] = [];
  cookedDataSource: TemperatureModel[] = [];
  editDate: Timestamp;
  fromDate: Timestamp;
  toDate: Timestamp;
  slFomr: NgForm;
  freezersExport = [];
  fridgesExport = [];
  
  fridgeData: any;
  freezerData: any;
  hotsData: any;
  cookedData: any;
  maxDate = new Date();
  
    
  constructor(private fb: FormBuilder,
            private router: Router,
            private temperatureService: TemperatureService,
            private dialog: MatDialog,
            private userService: UserService,
            private afs: AngularFirestore,
            private exportService: ExportService) {
  }

  ngOnInit() {
    this.getAllTemperatures();
  }

  ngAfterViewInit() {
    if (this.fridgeData) this.fridgeData.paginator = this.fridgePaginator;
  }



  getFridges() {
    this.temperatureService.getFridges()
      .subscribe(fridges => {
        this.fridgeDataSource = fridges;
        this.fridgeData = new MatTableDataSource<TemperatureModel>(fridges);
        this.fridgeData.paginator = this.fridgePaginator;
      });
  }

  getFridgesList() {
    this.temperatureService.getFridgesList()
      .subscribe(fridges => {
        this.fridgeDataSource = fridges;
        this.fridgeData = new MatTableDataSource<TemperatureModel>(fridges);
        this.fridgeData.paginator = this.fridgePaginator;
      });
  }

  getFreezers() {
    this.temperatureService.getFreezers()
      .subscribe(freezers => {
        this.freezerDataSource = freezers;
        this.freezerData = new MatTableDataSource<TemperatureModel>(freezers);
        this.freezerData.paginator = this.freezerPaginator;
      });
  }

  getFreezersList() {
    this.temperatureService.getFreezersList()
      .subscribe(freezers => {
        this.freezerDataSource = freezers;
        this.freezerData = new MatTableDataSource<TemperatureModel>(freezers);
        this.freezerData.paginator = this.freezerPaginator;
      });
  }

  getHots() {
    this.temperatureService.getHots()
      .subscribe(results => {
        this.hotsDataSource = results;
        this.hotsData = new MatTableDataSource<TemperatureModel>(results);
        this.hotsData.paginator = this.hotsPaginator;
      });
  }

  getHotsList() {
    this.temperatureService.getHotsList()
      .subscribe(results => {
        this.hotsDataSource = results;
        this.hotsData = new MatTableDataSource<TemperatureModel>(results);
        this.hotsData.paginator = this.hotsPaginator;
      });
  }

  getCooked(dateUI: Timestamp) {
    this.temperatureService.getCooked()
      .subscribe(results => {        
        const newTemp: Partial<TemperatureModel> = {
          name: '',      
          category: 'COOKED-BY-DATE',      
          urid: this.userService.getUserId(),
          docId: this.afs.createId(),
          date: dateUI,
        };        
        this.cookedDataSource = results;
        this.cookedDataSource.push(newTemp as TemperatureModel);
        this.cookedData = new MatTableDataSource<TemperatureModel>([newTemp as TemperatureModel]);
        this.cookedData.paginator = this.cookedPaginator;
      });
  }

  getTemperaturesByDate(event: MatDatepickerInputEvent<Date>) {
    this.editDate = Timestamp.fromDate(event.target.value)
    this.getTemperaturesByTimestamp(this.editDate)
  }

  reloadTemperatures() {
    if(this.editDate != null) {
      this.getTemperaturesByTimestamp(this.editDate)
    }
  }

  updateTemperatureList() {
    // this.getTemperaturesByTimestamp(this.editDate)
    this.getAllTemperatures()
  }
  
  getAllTemperatures() {
    this.fridgeData = [];
    this.freezerData =  [];
    this.hotsData = [];
    this.cookedData=  [];
    this.temperatureService.getFridgesList()
    .subscribe(temps => {
      if(temps.length > 0) {
        this.fridgeData = [];
        this.fridgeDataSource = temps;
        this.fridgeData = new MatTableDataSource<TemperatureModel>(temps);
        this.fridgeData.paginator = this.fridgePaginator;
      } else {
        this.getFridges();
      }
    });
    
    this.temperatureService.getFreezersList()
      .subscribe(temps => {
        if(temps.length > 0) {
          this.freezerDataSource = temps;
          this.freezerData = new MatTableDataSource<TemperatureModel>(temps);
          this.freezerData.paginator = this.freezerPaginator;
        } else {
          this.getFreezers();
        }
      });

      this.temperatureService.getHotsList()
      .subscribe(temps => {
        if(temps.length > 0) {
          this.hotsDataSource = temps;
          this.hotsData = new MatTableDataSource<TemperatureModel>(temps);
          this.hotsData.paginator = this.hotsPaginator;
        } else {
          this.getHots();
        }
      });
        this.temperatureService.getCookedList()
        .subscribe(temps => {
          if(temps.length > 0) {
            this.cookedDataSource = temps;
            this.cookedDataSource = temps;
            const extraTemp: Partial<TemperatureModel> = {
                      name: '',      
                      category: 'COOKED-BY-DATE',      
                      urid: this.userService.getUserId(),
                      docId: this.afs.createId(),
            };
            temps.push(extraTemp as TemperatureModel);
            this.cookedData = new MatTableDataSource<TemperatureModel>(temps);
            this.cookedData.paginator = this.cookedPaginator;
          } else {
            this.getCooked(this.editDate);
          }
        });
  }

  getTemperaturesByTimestamp(date: Timestamp) {
    this.fridgeData = [];
    this.freezerData =  [];
    this.hotsData = [];
    this.cookedData=  [];
    // this.temperatureService.getFridgesByDate(date)
    this.temperatureService.getCombinedFridges(date)
    .subscribe(temps => {
      if(temps.length > 0) {
        this.fridgeData = [];
        this.fridgeDataSource = temps;
        this.fridgeData = new MatTableDataSource<TemperatureModel>(temps);
        this.fridgeData.paginator = this.fridgePaginator;
      } else {
        this.getFridgesList();
      }
    });
    
    // this.temperatureService.getFreezersByDate(date)
    this.temperatureService.getCombinedFreezers(date)
      .subscribe(temps => {
        if(temps.length > 0) {
          this.freezerDataSource = temps;
          this.freezerData = new MatTableDataSource<TemperatureModel>(temps);
          this.freezerData.paginator = this.freezerPaginator;
        } else {
          this.getFreezersList();
        }
      });

      // this.temperatureService.getHotsByDate(date)
      this.temperatureService.getCombinedHots(date)
      .subscribe(temps => {
        if(temps.length > 0) {
          this.hotsDataSource = temps;
          this.hotsData = new MatTableDataSource<TemperatureModel>(temps);
          this.hotsData.paginator = this.hotsPaginator;
        } else {
          this.getHotsList();
        }
      });

      this.temperatureService.getCombinedCooked(date)
      .subscribe(temps => {
        if(temps.length > 0) {
          this.cookedDataSource = temps;
          const extraTemp: Partial<TemperatureModel> = {
            name: '',      
            category: 'COOKED-BY-DATE',      
            urid: this.userService.getUserId(),
            docId: this.afs.createId(),
          };
          temps.push(extraTemp as TemperatureModel);
          this.cookedData = new MatTableDataSource<TemperatureModel>(temps);
          this.cookedData.paginator = this.cookedPaginator;
        } else {
          this.getCooked(date);
        }  
      });
  }

  onDeleteFridgeTemperature(index: number) {
    if(this.fridgeDataSource[index].id !== null ||
        this.fridgeDataSource[index].id !== undefined) {
      this.temperatureService.delteTemperature(this.fridgeDataSource[index].docId, this.fridgeDataSource[index].name, "FRIDGES-BY-DATE", "FRIDGES-LIST")
    .pipe(
      tap( () => {
        Swal.fire('Η διαγραφή ολοκληρώθηκε!', 'Η εγγραφή διαγράφηκε επιτυχώς.', 'success');
      }),
      catchError(error => {
        console.log("error");
        alert("Could delete temperature");
        return throwError(error);
      })
    )
    .subscribe();
    }
    this.fridgeDataSource.splice(index, 1);
    this.fridgeData = new MatTableDataSource<TemperatureModel>(this.fridgeDataSource);
    this.fridgeData.paginator = this.fridgePaginator;
  }

  onDeleteFreezerTemperature(index: number) {
    if(this.freezerDataSource[index].id !== null ||
      this.freezerDataSource[index].id !== undefined) {
      this.temperatureService.delteTemperature(this.freezerDataSource[index].docId, this.freezerDataSource[index].name, "FREEZERS-BY-DATE", "FREEZERS-LIST")
      .pipe(
        tap( () => {
          Swal.fire('Η διαγραφή ολοκληρώθηκε!', 'Η εγγραφή διαγράφηκε επιτυχώς.', 'success');
        }),
        catchError(error => {
          console.log("error");
          alert("Could delete temperature");
          return throwError(error);
        })
      )
      .subscribe();
      }
      this.freezerDataSource.splice(index, 1);
      this.freezerData = new MatTableDataSource<TemperatureModel>(this.freezerDataSource);
  }

  onDeleteCookedTemperature(index: number) {
    if(this.cookedDataSource[index].id !== null ||
      this.cookedDataSource[index].id !== undefined) {
      this.temperatureService.delteTemperature(this.cookedDataSource[index].docId, this.cookedDataSource[index].name, "COOKED-BY-DATE", "COOKED-LIST")
      .pipe(
        tap( () => {
          Swal.fire('Η διαγραφή ολοκληρώθηκε!', 'Η εγγραφή διαγράφηκε επιτυχώς.', 'success');
        }),
        catchError(error => {
          alert("Could delete temperature");
          return throwError(error);
        })
      )
      .subscribe();
      }
      this.cookedDataSource.splice(index, 1);
      this.cookedData = new MatTableDataSource<TemperatureModel>(this.cookedDataSource);
  }

  onDeleteHotTemperature(index: number) {
    if(this.hotsDataSource[index].id !== null ||
      this.hotsDataSource[index].id !== undefined) {
      this.temperatureService.delteTemperature(this.hotsDataSource[index].docId, this.hotsDataSource[index].name, "HOTS-BY-DATE", "HOTS-LIST")
      .pipe(
        tap( () => {
          Swal.fire('Η διαγραφή ολοκληρώθηκε!', 'Η εγγραφή διαγράφηκε επιτυχώς.', 'success');
        }),
        catchError(error => {
          alert("Could delete temperature");
          return throwError(error);
        })
      )
      .subscribe();
      }
      this.hotsDataSource.splice(index, 1);
      this.hotsData = new MatTableDataSource<TemperatureModel>(this.hotsDataSource);
  }

  saveAll() {
    if (this.editDate == null) {
      Swal.fire({
        icon: 'error',
        title: 'Σφάλμα Επικύρωσης',
        text: 'Παρακαλώ επιλέξτε μια ημερομηνία πριν αποθηκεύσετε!',
      });
      return;
    }
    Swal.fire({
      title:'Συντήρηση:Οι θερμοκρασίες θα πρέπει να ειναι < +5°C.\n' 
      + 'Κατάψυξη:Οι θερμοκρασίες θα πρέπει να ειναι < -18°C.\n'
      + 'Διατήρηση εν θερμώ:Οι θερμοκρασίες δεν θα πρέπει να ειναι < 60°C.\n'
      + 'Μαγειρεμένα:Οι θερμοκρασίες δεν θα πρέπει να ειναι < 75°C.\n'
      + 'Είστε σίγουροι;',
      showDenyButton: true,        
      confirmButtonText: 'Αποθήκευση',
      denyButtonText: `Ακύρωση`,
      width: '800px'
    }).then((result) => {
      if (result.isConfirmed) {
        this.onSaveFridgeData();
        this.onSaveFreezerData();
        this.onSaveHotData();
        this.onSaveCookedData();
      } else if (result.isDenied) {
        Swal.fire('Οι θερμοκρασίες δεν θα αποθηκευτούν', '', 'info')
        this.reloadTemperatures();
      }
    })   
  }

  onSaveFridgeData() {
    if(this.fridgeDataSource.length > 0) {
      this.fridgeDataSource.forEach(t => {
        t.date = this.editDate ;
        t.category = "FRIDGES-BY-DATE";
        t.urid = this.userService.getUserId();        
        this.temperatureService.getTemperaturesByDocIdAndName(t.docId, t.category, t.name)
        .subscribe(temps => {
          if(temps.length == 0) {
            if(t.temperatureAfternoon !== null && t.temperatureAfternoon !== '') {
              t.docId = this.afs.createId();
              this.saveTemperature(t, t.docId) ;
            }
          } else {
            if(t.temperatureAfternoon !== null && t.temperatureAfternoon !== '') {
              this.temperatureService.updateTemperature(t.docId, t.category, t);
            }
          }
        });
      })
    }    
  }

  onSaveFreezerData() {
    if(this.freezerDataSource.length > 0) {
      this.freezerDataSource.forEach(t => {
        t.date = this.editDate ; 
        t.category = "FREEZERS-BY-DATE";
        t.urid = this.userService.getUserId();
        this.temperatureService.getTemperaturesByDocIdAndName(t.docId, t.category, t.name)
        .subscribe(temps => {
          if(temps.length == 0) {
            if(t.temperatureAfternoon !== null && t.temperatureAfternoon !== '') {
              t.docId = this.afs.createId();
              this.saveTemperature(t, t.docId) ;
            }
          } else {
            if(t.temperatureAfternoon !== null && t.temperatureAfternoon !== '') {
              this.temperatureService.updateTemperature(t.docId, t.category, t);
            }
          }
        });
      })
    }
  }

  onSaveHotData() {
    if(this.hotsDataSource.length > 0) {
      this.hotsDataSource.forEach(t => {
        t.date = this.editDate ; 
        t.category = "HOTS-BY-DATE";
        t.urid = this.userService.getUserId();
        this.temperatureService.getTemperaturesByDocIdAndName(t.docId, t.category, t.name)
        .subscribe(temps => {
          if(temps.length == 0) {
            if(t.temperature !== null && t.temperature !== '') {
              t.docId = this.afs.createId();
              this.saveTemperature(t, t.docId) ;
            }
          } else {
            if(t.temperature !== null && t.temperature !== '') {
              this.temperatureService.updateTemperature(t.docId, t.category, t);
            }
          }
        });
      })
    }
  }

  onSaveCookedData() {
    if(this.cookedDataSource.length > 0) {
      this.cookedDataSource.forEach(t => {
        t.date = this.editDate ; 
        t.category = "COOKED-BY-DATE";
        t.urid = this.userService.getUserId();
        this.temperatureService.getTemperaturesByDocIdAndName(t.docId, t.category, t.name)
        .subscribe(temps => {
          if(temps.length == 0) {
            t.docId = this.afs.createId();
            if(t.name !== null && t.name !== undefined && t.name !== "") {
              this.saveTemperature(t, t.docId) ;
            }
          } else {
            this.temperatureService.updateTemperature(t.docId, t.category, t);
          }
          this.temperatureService.delteCookedList()
        });
      })
    }    
  }

  saveTemperature(newTemp: TemperatureModel, docId: string) {
    this.temperatureService.saveTemperature(newTemp)
                  .pipe(
                      tap(() => {
                        Swal.fire(
                          'Οι θερμοκρασιες αποθηκεύτηκαν με επιτυχία!',
                        )
                        this.router.navigateByUrl("/temperatures")
                      }),
                      catchError(err => {
                        Swal.fire({
                          icon: 'error',
                          title: 'Oops...',
                          text: 'Something went wrong!'
                        })
                        return throwError(err)
                      })
                  )
                  .subscribe();
  }

  onSubmit(form: NgForm) {
    const value = form.value;
  }

  setDateFrom(event: MatDatepickerInputEvent<Date>) {
    this.fromDate = Timestamp.fromDate(event.target.value)
  }

  setDateTo(event: MatDatepickerInputEvent<Date>) {
    this.toDate = Timestamp.fromDate(event.target.value);
  }

  addRow() {
    const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.minWidth = "500px";
      dialogConfig.minHeight = "320px";
      this.dialog.open(AddRowTemperatureComponent, dialogConfig)
          .afterClosed()
          .subscribe(() => {
            if(this.editDate !== null && this.editDate !== undefined) {
              this.getTemperaturesByTimestamp(this.editDate);
            } else {
              this.getAllTemperatures();
            }
          })
  }

  export() {
    this.exportService.exportTemperature(this.fromDate, this.toDate)
  }

}
