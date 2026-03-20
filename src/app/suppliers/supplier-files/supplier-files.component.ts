import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { SupplierFile } from '../supplier-file.model';
import { ExportService } from 'src/app/services/export.service';


@Component({
  selector: 'app-supplier-files',
  templateUrl: './supplier-files.component.html',
  styleUrls: ['./supplier-files.component.css']
})
export class SupplierFilesComponent implements OnInit {

  descriptionText : string = `Στο πεδίο “Αρχεία προμηθευτών” μπορείς να προσθέσεις και να αξιολογήσεις τους προμηθευτές σου.`;

  menu: SupplierFile []  = [];
  selectedTabIndex = 0; 

  ngOnInit(): void {
    this.fetchSupplierFilesHeaders();
  }

  constructor(  private service: SupplierService,
              private fileUploadService: FileUploadService, 
              private exportService: ExportService ) {
   }

  fetchSupplierFilesHeaders() {
        this.service.loadByCategory('supplier-files').subscribe(headers => {              
            this.service.loadHeadersByMenuId(headers [0].id).subscribe(menu => {
            this.menu = menu;
            });
        });
    }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
      this.fileUploadService.getSuppliersFiles('supplier-files'); 
      this.selectedTabIndex = tabChangeEvent.index;
  }

  export() {
    this.exportService.exportSuppliersEvaluation();
  }
 
}