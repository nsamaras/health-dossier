import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BusinessService } from 'src/app/services/business.service';
import { BusinessFile } from './business-file.model';

@Component({
  selector: 'app-business-file',
  templateUrl: './business-file.component.html',
  styleUrls: ['./business-file.component.css']
})
export class BusinessFileComponent implements OnInit {

  @Input() file: BusinessFile;  
  
  constructor() {
   }

  ngOnInit(): void {
  }

  onSelected() {
  }

}
