import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { DisinsectService } from 'src/app/services/disinsect.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { DisinsectFile } from '../disinsect-file.model';

@Component({
  selector: 'app-disinsect-files',
  templateUrl: './disinsect-files.component.html',
  styleUrls: ['./disinsect-files.component.css']
})
export class DisinsectFilesComponent implements OnInit {

  descriptionText : string = `Στο πεδίο “Αρχεία απεντομώσεων και μυοκτονιών” μπορείς να βρεις/προσθέσεις τα εξής:`;
  items: string[] = ['Πιστοποιητικά εφαρμογών', 
                        'Συμφωνητικό', 
                        'Κατόψεις', 
                        'Λοιπά αρχεία φακέλου απεντόμωσης-μυοκτονίας'];

  menu: DisinsectFile []  = [];
  subscription: Subscription;

  constructor( private service: DisinsectService,                
              private fileUploadService: FileUploadService) { }

  ngOnInit(): void {
    this.fetchFiles();
  }
  
  fetchFiles() {
        this.service.loadByCategory('disinsect-files').subscribe(headers => {              
            this.service.loadHeadersByMenuId(headers [0].id).subscribe(menu => {
            this.menu = menu;
            });
        });
    }

    public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
        this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'disinsect-files');
        this.fileUploadService.getFilesByCategory('disinsect-files'); 
    }

}
