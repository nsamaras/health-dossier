import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { StaffService } from 'src/app/services/staff.service';
import { WaterService } from 'src/app/services/water.service';
import { WaterFile } from '../water-file.model';

@Component({
  selector: 'app-water-files',
  templateUrl: './water-files.component.html',
  styleUrls: ['./water-files.component.css']
})
export class WaterFilesComponent implements OnInit {

  descriptionText : string = `Στο πεδίο “Aρχεία Νερού” μπορείς να βρεις/προσθέσεις τα εξής:`;
  items: string[] = ['Λίστα προσωπικού', 
                        'Λογαριασμός υδροδότησης', 
                        'Ανάλυση νερού', 
                        'Καταλληλότητα πάγου'];

  menu: WaterFile []  = [];
  subscription: Subscription;

  constructor( private service: WaterService,                
              private fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    this.fetchFiles();
  }
  
  fetchFiles() {
        this.service.loadByCategory('water-files').subscribe(headers => {              
            this.service.loadHeadersByMenuId(headers [0].id).subscribe(menu => {
            this.menu = menu;
            });
        });
    }

    public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
        this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'water-files');
        this.fileUploadService.getFilesByCategory('water-files'); 
    }

}
