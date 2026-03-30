import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { SupplierService } from 'src/app/services/supplier.service';
import { SupplierFile } from '../supplier-file.model';
import { ExportService } from 'src/app/services/export.service';
import { UploadCertDialogComponent } from 'src/app/file-upload/upload-cert-dialog/upload-cert-dialog.component';


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
              private exportService: ExportService,
              private dialog: MatDialog ) {
   }

  // ...existing code...

  openUploadDialog(): void {
    this.dialog.open(UploadCertDialogComponent, {
      width: '480px',
      disableClose: false
    });
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
      if (tabChangeEvent.index === 2) {
        this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'supplier-files');
        this.fileUploadService.getFilesByCategory('supplier-files');
      }
  }

}