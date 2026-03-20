import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SupplierService } from 'src/app/services/supplier.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { SupplierModel } from '../supplier.model';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.css']
})
export class AddSupplierComponent implements OnInit {

   suppliersTypes: any[];
   selectedType: string | null = null;
   customType: string = '';  

  form = this.fb.group({
    name: ['', Validators.required],  
    extraSuplierType:  [''], 
  });

  constructor(private fb: FormBuilder,private router: Router,
    private supplierService: SupplierService,
    private userService: UserService,
    private dialogRef: MatDialogRef<AddSupplierComponent>,
    private afs: AngularFirestore) { }

  ngOnInit(): void {
    this.loadSuppliersTypes();
  }

  saveSupplier() {
    const val = this.form.value;
    this.suppliersTypes.forEach(supplier => {
      if (supplier.checked) {
        const newSupplier: Partial<SupplierModel> = {
          name: val.name,      
          type: supplier.description,      
          urid: this.userService.getUserId(),
          docId: this.afs.createId()
        }
        this.saveSupplierRequest(newSupplier);
      }
    });
    if(val.extraSuplierType !== '' && val.extraSuplierType !== undefined && val.extraSuplierType !== "") {
      const newSupplier: Partial<SupplierModel> = {
        name: val.name,      
        type: val.extraSuplierType,      
        urid: this.userService.getUserId(),
        docId: this.afs.createId()
      }
      this.saveSupplierRequest(newSupplier);
    }
  }

  saveSupplierRequest(newSupplier: any) {
    this.supplierService.saveSupplier(newSupplier, newSupplier.docId)
      .pipe(
        tap(() => {
          Swal.fire('Επιτυχημένη εγγραφή', 'success');
          this.router.navigateByUrl("/supplier-files");
          this.close();
        }),
        catchError(err => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Κάτι πήγε στραβά'
          });
          return throwError(() => err);
        })
      )
      .subscribe();
  }
  
  public loadSuppliersTypes() {
    this.suppliersTypes = [];
    this.supplierService.loadSuppliersTypes().subscribe(results => {
      this.suppliersTypes = results.map((supplier: any) => ({
        ...supplier,    
        checked: false  
      }));
    });
  }
  

  close() {
    this.dialogRef.close();
  }

  onCheckChange(event, suppliersType: any) {
    const foundSupplier = this.suppliersTypes.find(supplier => supplier.seqNo === suppliersType.seqNo);
    if (foundSupplier) {
      foundSupplier.checked = event.checked;
    }
  }

}

function model(arg0: boolean) {
  throw new Error('Function not implemented.');
}
