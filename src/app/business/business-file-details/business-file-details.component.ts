import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FileUpload } from 'src/app/file-upload/file-upload';
import { UploadListComponent } from 'src/app/file-upload/upload-list/upload-list.component';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { BusinessFile } from '../business-file.model';

@Component({
  selector: 'app-business-file-details',
  templateUrl: './business-file-details.component.html',
  styleUrls: ['./business-file-details.component.css']
})
export class BusinessFileDetailsComponent implements OnInit {
 
  @Input() file: BusinessFile

  @ViewChild(UploadListComponent) uploadListComponent;

  constructor() { }

  ngOnInit(): void {    
  }
  
  

}




