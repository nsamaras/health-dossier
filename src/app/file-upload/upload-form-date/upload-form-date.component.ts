import { Component, OnInit } from '@angular/core';
import { FileUpload } from '../file-upload';
import { FileUploadService } from 'src/app/services/file-upload.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-form-date',
  templateUrl: './upload-form-date.component.html',
  styleUrls: ['./upload-form-date.component.css']
})
export class UploadFormDateComponent implements OnInit {

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;
  fileName: string = 'Δεν επιλέχθηκε αρχείο';
  expiryDate: Date | null = null;

  constructor(private uploadService: FileUploadService) {}

  ngOnInit(): void {}

  selectFile(event): void {
    this.selectedFiles = event.target.files;
    this.fileName = this.selectedFiles.item(0)?.name || 'Δεν επιλέχθηκε αρχείο';
  }

  upload(): void {
    if (!this.selectedFiles || !this.expiryDate) return;

    const file = this.selectedFiles.item(0);
    this.selectedFiles = undefined;
    this.currentFileUpload = new FileUpload(file);

    this.uploadService.pushFileToStorageWithDate(this.currentFileUpload, this.expiryDate)
      .subscribe(
        percentage => {
          this.percentage = Math.round(percentage);
          if (this.percentage === 100) {
            Swal.fire('Επιτυχία!', 'Το αρχείο ανέβηκε επιτυχώς!', 'success');
            this.currentFileUpload = null;
            this.fileName = 'Δεν επιλέχθηκε αρχείο';
            this.percentage = 0;
            this.expiryDate = null;
          }
        },
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Σφάλμα',
            text: 'Κάτι πήγε στραβά κατά την αποστολή του αρχείου!'
          });
        }
      );
  }
}

