import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BusinessFile } from '../business-file.model';
import { BusinessService } from 'src/app/services/business.service';
import { AuthService } from 'src/app/auth/auth.service';
import { exhaustMap, map, take, tap } from 'rxjs/operators'
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import 'firebase/firestore';
import { Menu } from 'src/app/model/menu';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-business-files',
  templateUrl: './business-files.component.html',
  styleUrls: ['./business-files.component.css'], 
 
})
export class BusinessFilesComponent implements OnInit {

  descriptionText : string = `Στο πεδίο “Aρχεία Eπιχείρησης” μπορείς να βρεις/προσθέσεις τα εξής:`;
  items: string[] = ['Γνωστοποίηση', 
                        'Διάγραμμα ροής', 
                        'Κατόψεις', 
                        'Λοιπά αρχεία άδειας', 
                        'Νομοθεσία'];

  menu: BusinessFile []  = [];
  subscription: Subscription;
  selectedBusinessFile: string;

  constructor( private service: BusinessService,                
                private fileUploadService: FileUploadService) { }

   ngOnInit(): void {
    this.fetchBusinessFiles();
  }

  fetchBusinessFiles() {
        this.service.loadByCategory('business-files').subscribe(headers => {              
            this.service.loadHeadersByMenuId(headers [0].id).subscribe(menu => {
            this.menu = menu;
            });
        });
    }

    public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
        this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'business-files');
        this.fileUploadService.getFilesByCategory('business-files'); 
    }

    removeId(data: any) {
        const newData: any = {...data};
        delete newData.id;
        return newData;
    }
}
