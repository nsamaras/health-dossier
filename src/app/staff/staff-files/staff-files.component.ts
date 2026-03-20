import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { BusinessFile } from 'src/app/business/business-file.model';
import { UploadListComponent } from 'src/app/file-upload/upload-list/upload-list.component';
import { BusinessService } from 'src/app/services/business.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { StaffService } from 'src/app/services/staff.service';
import { StaffFile } from '../staff-file.model';

@Component({
  selector: 'app-staff-files',
  templateUrl: './staff-files.component.html',
  styleUrls: ['./staff-files.component.css']
})
export class StaffFilesComponent implements OnInit {

  descriptionText : string = `Στο πεδίο “Aρχεία προσωπικού” μπορείς να βρεις/προσθέσεις τα εξής:`;
  items: string[] = ['Λίστα προσωπικού', 
                        'Πιστοποιητικά υγείας', 
                        'Εκπαιδεύσεις προσωπικού', 
                        'Σημάνσεις '];
                        
  menu: StaffFile []  = [];
  subscription: Subscription;

  constructor( private service: StaffService,                
                private fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    this.fetchFiles();
  }
  
  fetchFiles() {
        this.service.loadByCategory('staff-files').subscribe(headers => {              
            this.service.loadHeadersByMenuId(headers [0].id).subscribe(menu => {
            this.menu = menu;
            });
        });
    }

    public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
        this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'staff-files');
        this.fileUploadService.getFilesByCategory('staff-files'); 
    }
}
