import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {from, Observable, throwError} from 'rxjs';
import { FileUpload } from 'src/app/file-upload/file-upload';
import { FileUploadService } from 'src/app/services/file-upload.service';
import {catchError, concatMap, last, map, take, tap} from 'rxjs/operators';

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})
export class UploadFormComponent implements OnInit {

  selectedFiles: FileList;
  currentFileUpload: FileUpload;
  percentage: number;

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {    
  }

  selectFile(event): void {    
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    const file = this.selectedFiles.item(0);
    this.selectedFiles = undefined;
    this.currentFileUpload = new FileUpload(file);
    this.uploadService.pushFileToStorage(this.currentFileUpload)
          .subscribe(
              percentage => {
                this.percentage = Math.round(percentage);
              },
              error => {
                console.log(error);
              }
          );
  }
}