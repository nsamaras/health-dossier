import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { BusinessFile } from 'src/app/business/business-file.model';
import { UploadListComponent } from 'src/app/file-upload/upload-list/upload-list.component';
import { StaffFile } from '../staff-file.model';

@Component({
  selector: 'app-staff-file-details',
  templateUrl: './staff-file-details.component.html',
  styleUrls: ['./staff-file-details.component.css']
})
export class StaffFileDetailsComponent implements OnInit {

  @Input() file: BusinessFile

  @ViewChild(UploadListComponent) uploadListComponent;

  constructor() { }

  ngOnInit(): void {    
  }

}
