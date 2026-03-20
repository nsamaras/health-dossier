import { Component, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { from, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { FileUpload } from '../file-upload';


@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.css']
})
export class UploadListComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['position', 'name',  'download', 'delete'];
  dataSource: any[] = [];
  fileUploads: any[];
  private fileChangeSub: Subscription;

  fileDeleted = new EventEmitter<FileUpload>()

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {     
    this.uploadService.setMenuCategoryAndSubCategory(1, "business-files");
    this.onSubCategorySelected("business-files");
  } 
  
  onSubCategorySelected(category: string) {
    this.uploadService.getFilesByCategory(category);
    this.fileChangeSub = this.uploadService.filesChanged
      .subscribe(
        (fileUploads: File[]) => {
          this.dataSource = fileUploads;
        }
      );
  }

  ngOnDestroy(): void {
    this.fileChangeSub.unsubscribe();
  } 

  onDownload(index: number) {
    window.open(this.dataSource[index].url, "_blank")
  }

  onDelete(index: number) {
    this.uploadService.deleteFile(this.dataSource[index]);
  }

}
