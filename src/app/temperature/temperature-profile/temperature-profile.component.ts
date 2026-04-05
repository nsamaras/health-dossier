import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import {catchError, filter, take, tap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import { FormGroup } from '@angular/forms';
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
import { AddTemperatureComponent } from '../add-temperature/add-temperature.component';
import {MatIconModule} from '@angular/material/icon';
import { TemperatureService } from 'src/app/services/temperature.service';
import { TemperatureModel } from '../temperature.model';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-temperature-profile',
  templateUrl: './temperature-profile.component.html',
  styleUrls: ['./temperature-profile.component.css']
})
export class TemperatureProfileComponent implements OnInit {

  displayedColumns: string[] = ['name', 'delete'];
  fridgeDataSource : TemperatureModel[] = []; 
  freezerDataSource : TemperatureModel[] = [];
  hotsDataSource : TemperatureModel[] = [];
  cookDatasource: TemperatureModel[] = [];
  fridgeData: any;
  freezerData: any;
  hotsData: any;
  cookData: any;

  constructor(private router: Router,
    private dialog: MatDialog,
    private temperatureService: TemperatureService,
    private userService: UserService,
    private afs: AngularFirestore) {
}

  ngOnInit(): void {
    this.userService.isActiveUser$.pipe(
      filter(active => active),
      take(1)
    ).subscribe(() => {
      this.reloadProfile();
    });
  }

  addTemperature() {
    const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.minWidth = "400px";     
      this.dialog.open(AddTemperatureComponent, dialogConfig)
          .afterClosed()
          .subscribe(() => {
            this.reloadProfile();
          })
  }

  reloadProfile() {
    this.getFridges();
    this.getFreezers();
    this.getCooked();
    this.getHots();
  }

  getFridges() {
    this.temperatureService.getFridges()
      .subscribe(fridges => {
        this.fridgeDataSource = fridges;
        this.fridgeData = new MatTableDataSource<TemperatureModel>(fridges);
      });
  }

  getFreezers() {
    this.temperatureService.getFreezers()
      .subscribe(freezers => {
        this.freezerDataSource = freezers;
        this.freezerData = new MatTableDataSource<TemperatureModel>(freezers);
      });
  }

  getHots() {
    this.temperatureService.getHots()
      .subscribe(results => {
        this.hotsDataSource = results;
        this.hotsData = new MatTableDataSource<TemperatureModel>(results);
      });
  }

  getCooked() {
    this.temperatureService.getCooked()
      .subscribe(results => {
        this.cookDatasource = results;
        this.cookData = new MatTableDataSource<TemperatureModel>(results);
      });
  }

 
 
  onDeleteFridge(index: number) {
    if(this.fridgeDataSource[index].id !== null ||
        this.fridgeDataSource[index].id !== undefined) {
      this.temperatureService.deleleteCategoryFromProfile(this.fridgeDataSource[index].docId, "FRIDGES")
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
  }

  onDeleteFreezer(index: number) {
    if(this.freezerDataSource[index].id !== null ||
      this.freezerDataSource[index].id !== undefined) {
      this.temperatureService.deleleteCategoryFromProfile(this.freezerDataSource[index].docId, "FREEZERS")
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

  onDeleteCook(index: number) {
    if(this.cookDatasource[index].id !== null ||
      this.cookDatasource[index].id !== undefined) {
      this.temperatureService.deleleteCategoryFromProfile(this.cookDatasource[index].docId, "COOKED")
      .pipe(
        tap( () => {
          Swal.fire('Η διαγραφή ολοκληρώθηκε!', 'Η εγγραφή διαγράφηκε επιτυχώς.', 'success');
        }),
        catchError(error => {
          console.log("error");
          return throwError(error);
        })
      )
      .subscribe();
      }
      this.cookDatasource.splice(index, 1);
      this.cookData = new MatTableDataSource<TemperatureModel>(this.cookDatasource);
  }

  onDeleteHot(index: number) {
    if(this.hotsDataSource[index].id !== null ||
      this.hotsDataSource[index].id !== undefined) {
      this.temperatureService.deleleteCategoryFromProfile(this.hotsDataSource[index].docId, "HOTS")
      .pipe(
        tap( () => {
          Swal.fire('Η διαγραφή ολοκληρώθηκε!', 'Η εγγραφή διαγράφηκε επιτυχώς.', 'success');
        }),
        catchError(error => {
          console.log("error");
          return throwError(error);
        })
      )
      .subscribe();
      }
      this.hotsDataSource.splice(index, 1);
      this.hotsData = new MatTableDataSource<TemperatureModel>(this.hotsDataSource);
  }

  onSaveFridgeData() {
    if(this.fridgeDataSource.length > 0) {
      this.fridgeDataSource.forEach(t => {
        t.category = "FRIDGES";
        t.urid = this.userService.getUserId();        
        if(t.docId === null || t.docId === undefined) {
            t.docId = this.afs.createId();
        }else {
          this.temperatureService.updateCategoryFromProfile(t.docId, t.category, t)
          .pipe(
            tap( () => {
              Swal.fire('Tο όνομα ανανεώθηκε με επιτυχία', 'success');
            }),
            catchError(error => {
              console.log("error");
              alert("Could delete temperature");
              return throwError(error);
            })
          ).subscribe();
        }
      })
    }
  }

  onSaveFreezerData() {
    if(this.freezerDataSource.length > 0) {
      this.freezerDataSource.forEach(t => {
        t.category = "FREEZERS";
        t.urid = this.userService.getUserId();
        if(t.docId === null || t.docId === undefined) {
          t.docId = this.afs.createId();
        } else {
          this.temperatureService.updateCategoryFromProfile(t.docId, t.category, t)
          .pipe(
            tap( () => {
              Swal.fire('Tο όνομα ανανεώθηκε με επιτυχία', 'success');
            }),
            catchError(error => {
              console.log("error");
              alert("Could delete temperature");
              return throwError(error);
            })
          ).subscribe();
        }
      })
    }
  }

  onSaveCookData() {
    if(this.cookDatasource.length > 0) {
      this.cookDatasource.forEach(t => {
        t.category = "COOKED";
        t.urid = this.userService.getUserId();
        if(t.docId === null || t.docId === undefined) {
          t.docId = this.afs.createId();
        } else {
          this.temperatureService.updateCategoryFromProfile(t.docId, t.category, t)
          .pipe(
            tap( () => {
              Swal.fire('Tο όνομα ανανεώθηκε με επιτυχία', 'success');
            }),
            catchError(error => {
              console.log("error");
              alert("Could delete temperature");
              return throwError(error);
            })
          ).subscribe();
        }
      })
    }
  }

  onSaveHotData() {
    if(this.hotsDataSource.length > 0) {
      this.hotsDataSource.forEach(t => {
        t.category = "HOTS";
        t.urid = this.userService.getUserId();
        if(t.docId === null || t.docId === undefined) {
          t.docId = this.afs.createId();
        } else {
          this.temperatureService.updateCategoryFromProfile(t.docId, t.category, t)
          .pipe(
            tap( () => {
              Swal.fire('Tο όνομα ανανεώθηκε με επιτυχία', 'success');
            }),
            catchError(error => {
              console.log("error");
              alert("Could delete temperature");
              return throwError(error);
            })
          ).subscribe();
        }
      })
    }
  }
}
