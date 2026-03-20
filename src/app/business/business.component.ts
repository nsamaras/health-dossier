import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../services/business.service';
import { BusinessFile } from './business-file.model';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css'],
  providers: [BusinessService]
})
export class BusinessComponent implements OnInit {

  selectedFile: BusinessFile;

  constructor(private businessService: BusinessService) {}

  ngOnInit(): void {
    this.businessService.fileSelected.subscribe(
      (businessFile : BusinessFile) => {
        this.selectedFile = businessFile;
      }
    );
  }

}
