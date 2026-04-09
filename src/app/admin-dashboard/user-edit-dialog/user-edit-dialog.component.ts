import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { UserModel } from '../../auth/user.model';

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.css']
})
export class UserEditDialogComponent {

  form: FormGroup;
  uploadProgress: number | null = null;
  uploading = false;
  contractUrl: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    private storage: AngularFireStorage,
    @Inject(MAT_DIALOG_DATA) public data: UserModel
  ) {
    this.contractUrl = data.contracts || '';
    this.form = this.fb.group({
      name:        [data.name        || '', Validators.required],
      email:       [data.email       || '', [Validators.required, Validators.email]],
      vat:         [data.vat         || ''],
      phoneNumber: [data.phoneNumber || ''],
      isActive:    [!!data.isActive],
      isAdmin:     [!!data.isAdmin]
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.uploading = true;
    this.uploadProgress = 0;

    const path = `contracts/${this.data.urid}/${Date.now()}_${file.name}`;
    const ref  = this.storage.ref(path);
    const task = this.storage.upload(path, file);

    task.percentageChanges().subscribe(p => {
      this.uploadProgress = Math.round(p ?? 0);
    });

    task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe(url => {
          this.contractUrl  = url;
          this.uploading    = false;
          this.uploadProgress = null;
        });
      })
    ).subscribe();
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({
      ...this.form.value,
      contracts: this.contractUrl
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
