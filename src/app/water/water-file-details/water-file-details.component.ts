import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UploadListComponent } from 'src/app/file-upload/upload-list/upload-list.component';
import { WaterFile } from '../water-file.model';

@Component({
  selector: 'app-water-file-details',
  templateUrl: './water-file-details.component.html',
  styleUrls: ['./water-file-details.component.css']
})
export class WaterFileDetailsComponent implements OnInit {

  @Input() file: WaterFile

  @ViewChild(UploadListComponent) uploadListComponent;

  constructor() { }

  ngOnInit(): void {    
  }

}
