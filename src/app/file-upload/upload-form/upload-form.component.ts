import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {from, Observable, throwError} from 'rxjs';
import { FileUpload } from 'src/app/file-upload/file-upload';
import { FileUploadService } from 'src/app/services/file-upload.service';
import {catchError, concatMap, last, map, take, tap} from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})
export class UploadFormComponent implements OnInit {

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;
  fileName: string = 'Δεν επιλέχθηκε αρχείο';

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {    
  }

  selectFile(event): void {    
    this.selectedFiles = event.target.files;
    this.fileName = this.selectedFiles.item(0)?.name || 'Δεν επιλέχθηκε αρχείο';
  }

  upload(): void {
    const file = this.selectedFiles.item(0);
    this.selectedFiles = undefined;
    this.currentFileUpload = new FileUpload(file);
    this.uploadService.pushFileToStorage(this.currentFileUpload)
          .subscribe(
              percentage => {
                this.percentage = Math.round(percentage);
                if (this.percentage === 100) {
                  Swal.fire('Επιτυχία!', 'Το αρχείο ανέβηκε επιτυχώς!', 'success');
                  this.currentFileUpload = null;
                  this.fileName = 'Δεν επιλέχθηκε αρχείο';
                  this.percentage = 0;
                }
              },
              error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Σφάλμα',
                  text: 'Κάτι πήγε στραβά κατά την αποστολή του αρχείου!'
                });
              }
          );
  }
}