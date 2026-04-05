import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { throwError } from 'rxjs';
import { catchError, filter, take, tap } from 'rxjs/operators';
import { SupplierService } from 'src/app/services/supplier.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { AddSupplierComponent } from '../add-supplier/add-supplier.component';
import { SupplierTypeModel } from '../supplier-type.model';
import { SupplierModel } from '../supplier.model';
import { ExportService } from 'src/app/services/export.service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}


@Component({
  selector: 'app-suppliers-list',
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.css']
})
export class SuppliersListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'type', 'delete'];
  suppliersDataSource : SupplierModel[] = [];
  suppliersData: any;
  suppliersTypes: any[];

  constructor(private dialog: MatDialog,
    private supplierService: SupplierService,
    private userService: UserService,
    private exportService: ExportService) {
    }

  ngOnInit(): void {
    this.userService.isActiveUser$.pipe(
      filter(active => active),
      take(1)
    ).subscribe(() => {
      this.loadSuppliersByUrid();
      this.loadSuppliersTypes();
    });
  }

  addSupplier() {
    const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.minWidth = "500px";     
      this.dialog.open(AddSupplierComponent, dialogConfig)
          .afterClosed()
          .subscribe(() => {
            this.loadSuppliersByUrid();
          })
  }

  loadSuppliersByUrid() {
    this.supplierService.loadSuppliersByUrid()
      .subscribe(results => {
        this.suppliersData = results;
      });
  }

  public loadSuppliersTypes() {
    this.suppliersTypes = [];
    this.supplierService.loadSuppliersTypes().subscribe(results => {              
      this.suppliersTypes = results;      
    });
  }

  onDeleteSupplier(supplier: any, index: number) {
    if(supplier !== null) {
      this.supplierService.onDeleteSupplierFromProfile(supplier)
        .pipe(
          tap( () => {
            Swal.fire('Η διαγραφή ολοκληρώθηκε!', 'Η εγγραφή διαγράφηκε επιτυχώς.', 'success');
          }),
          catchError(error => {
            console.log("error");
            alert("Δεν μπόρεσε να γίνει η διαγραφή");
            return throwError(error);
          })
        )
        .subscribe();
        }
    if (Array.isArray(this.suppliersData) && this.suppliersData.length > index) {
       this.suppliersData.splice(index, 1);
       this.suppliersData = new MatTableDataSource<SupplierModel>(this.suppliersData);
    } else {
      this.suppliersData = this.suppliersData.data;
      this.suppliersData.splice(index, 1);
      this.suppliersData = new MatTableDataSource<SupplierModel>(this.suppliersData);
    }
  }

  onSaveSupplier() {
    if(this.suppliersData.length > 0) {
      this.suppliersData.forEach(t => {
        t.urid = this.userService.getUserId();
          this.supplierService.updateSupplierFromProfile(t.docId, t)
          .pipe(
            tap( () => {
              Swal.fire('Ο προμηθευτής ανανεώθηκε με επιτυχία', 'success');
            }),
            catchError(error => {
              console.log("error");
              alert("Δεν μπόρεσε να γίνει η διόρθωση");
              return throwError(error);
            })
          ).subscribe();
      })
    }
  }

 exportSuppliers() {
    this.exportService.exportSuppliers();
  }


}
