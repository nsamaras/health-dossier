import { Component, EventEmitter, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { FileUpload } from 'src/app/file-upload/file-upload';
import { FileUploadService } from 'src/app/services/file-upload.service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-supplier-file-details',
  templateUrl: './supplier-file-details.component.html',
  styleUrls: ['./supplier-file-details.component.css']
})
export class SupplierFileDetailsComponent implements OnInit {
  
  displayedColumns: string[] = ['name',  'download'];
  dataSource: any[] = [];
  private fileChangeSub: Subscription;

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
    this.onSubCategorySelected("supplier-files");
  }

  onDownload(index: number) {
    window.open(this.dataSource[index].url, "_blank")
  }

  onSubCategorySelected(category: string) {
    this.uploadService.getSuppliersFiles(category);
    this.fileChangeSub = this.uploadService.filesChanged
      .subscribe(
        (fileUploads: File[]) => {
          this.dataSource = fileUploads;
        }
      );
  }
  
}
