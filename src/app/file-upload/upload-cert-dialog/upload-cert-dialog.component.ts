import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FileUpload } from '../file-upload';
import { FileUploadService } from 'src/app/services/file-upload.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-cert-dialog',
  templateUrl: './upload-cert-dialog.component.html',
  styleUrls: ['./upload-cert-dialog.component.css']
})
export class UploadCertDialogComponent {

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number = 0;
  fileName: string = 'Δεν επιλέχθηκε αρχείο';
  expiryDate: Date | null = null;

  constructor(
    private dialogRef: MatDialogRef<UploadCertDialogComponent>,
    private uploadService: FileUploadService
  ) {}

  selectFile(event): void {
    this.selectedFiles = event.target.files;
    this.fileName = this.selectedFiles.item(0)?.name || 'Δεν επιλέχθηκε αρχείο';
  }

  upload(): void {
    if (!this.selectedFiles) return;
    const file = this.selectedFiles.item(0);
    this.selectedFiles = undefined;
    this.currentFileUpload = new FileUpload(file);

    const upload$ = this.expiryDate
      ? this.uploadService.pushFileToStorageWithDate(this.currentFileUpload, this.expiryDate)
      : this.uploadService.pushFileToStorage(this.currentFileUpload);

    upload$.subscribe(
        percentage => {
          this.percentage = Math.round(percentage);
          if (this.percentage === 100) {
            Swal.fire({
              icon: 'success',
              text: 'Το αρχείο ανέβηκε επιτυχώς!',
              confirmButtonText: 'OK'
            }).then(() => this.dialogRef.close(true));
          }
        },
        () => {
          Swal.fire({ icon: 'error', title: 'Σφάλμα', text: 'Κάτι πήγε στραβά!' });
        }
      );
  }

  close(): void {
    this.dialogRef.close(false);
  }
}

