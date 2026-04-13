import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { StaffService } from 'src/app/services/staff.service';
import { StaffFile } from '../staff-file.model';
import { UploadCertDialogComponent } from 'src/app/file-upload/upload-cert-dialog/upload-cert-dialog.component';

@Component({
  selector: 'app-staff-files',
  templateUrl: './staff-files.component.html',
  styleUrls: ['./staff-files.component.css']
})
export class StaffFilesComponent implements OnInit {

  descriptionText: string = `Στο πεδίο "Aρχεία προσωπικού" μπορείς να βρεις/προσθέσεις τα εξής:`;
  items: string[] = ['Πιστοποιητικά υγείας', 'Εκπαιδεύσεις προσωπικού', 'Σημάνσεις'];

  menu: StaffFile[] = [];
  subscription: Subscription;

  constructor(
    private service: StaffService,
    private fileUploadService: FileUploadService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchFiles();
  }

  fetchFiles() {
    this.service.loadByCategory('staff-files').subscribe(headers => {
      this.service.loadHeadersByMenuId(headers[0].id).subscribe(menu => {
        this.menu = menu.filter(m => m.title !== 'Λίστα προσωπικού');
        if (menu.length > 0) {
          this.service.selectedTabTitle$.next(menu[0].title || '');
          this.fileUploadService.setMenuCategoryAndSubCategory(0, 'staff-files');
          this.fileUploadService.getFilesByCategory('staff-files');
        }
      });
    });
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    const title = this.menu[tabChangeEvent.index]?.title || '';
    this.service.selectedTabTitle$.next(title);
    this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'staff-files');
    this.fileUploadService.getDefaultAndCategoryFiles('staff-files', tabChangeEvent.index);
  }

  openUploadDialog(): void {
    this.dialog.open(UploadCertDialogComponent, {
      width: '480px',
      disableClose: false
    });
  }
}
