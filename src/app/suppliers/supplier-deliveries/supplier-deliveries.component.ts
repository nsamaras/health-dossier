import { Component, OnInit } from '@angular/core';
import { FileUploadService } from 'src/app/services/file-upload.service';

@Component({
  selector: 'app-supplier-deliveries',
  templateUrl: './supplier-deliveries.component.html',
  styleUrls: ['./supplier-deliveries.component.css']
})
export class SupplierDeliveriesComponent implements OnInit {

  constructor(private fileUploadService: FileUploadService) {}

  ngOnInit(): void {
    this.fileUploadService.setMenuCategoryAndSubCategory(2, 'supplier-files');
    this.fileUploadService.getFilesByCategory('supplier-files');
  }
}

