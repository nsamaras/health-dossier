import { Component, OnDestroy, OnInit, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { from, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { FileUpload } from '../file-upload';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';


@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.css']
})
export class UploadListComponent implements OnInit, OnDestroy, AfterViewInit {

  displayedColumns: string[] = ['position', 'name', 'download', 'delete'];
  dataSource = new MatTableDataSource<any>([]);
  fileUploads: any[];
  private fileChangeSub: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  fileDeleted = new EventEmitter<FileUpload>()

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
    this.fileChangeSub = this.uploadService.filesChanged
      .subscribe(
        (fileUploads: any[]) => {
          this.dataSource.data = fileUploads;
        }
      );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.fileChangeSub.unsubscribe();
  } 

  onDownload(index: number) {
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    const actualIndex = pageIndex * pageSize + index;
    window.open(this.dataSource.data[actualIndex].url, "_blank");
  }

  onDelete(index: number) {
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    const actualIndex = pageIndex * pageSize + index;
    this.uploadService.deleteFile(this.dataSource.data[actualIndex]);
  }
}
