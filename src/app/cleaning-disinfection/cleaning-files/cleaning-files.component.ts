import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UploadListComponent } from 'src/app/file-upload/upload-list/upload-list.component';
import { CleaningFile } from '../cleaning-file.model';
import { CleaningService } from 'src/app/services/cleaning.service';
import { FileUploadService } from 'src/app/services/file-upload.service';

@Component({
  selector: 'app-cleaning-files',
  templateUrl: './cleaning-files.component.html',
  styleUrls: ['./cleaning-files.component.css']
})
export class CleaningFilesComponent implements OnInit {

  @Input() file: CleaningFile

  @ViewChild(UploadListComponent) uploadListComponent;

  constructor(private service: CleaningService,                
    private fileUploadService: FileUploadService) { }

  ngOnInit(): void {    
  }

 

}
