import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-complete-profile-dialog',
  templateUrl: './complete-profile-dialog.component.html'
})
export class CompleteProfileDialogComponent {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompleteProfileDialogComponent>
  ) {
    this.form = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^69[0-9]{8}$/)]],
      vat:         ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]]
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close({
        phoneNumber: '+30' + this.form.value.phoneNumber,
        vat        : this.form.value.vat
      });
    }
  }

  skip() {
    this.dialogRef.close(null);
  }
}

