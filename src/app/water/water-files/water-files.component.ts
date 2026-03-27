import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { WaterService } from 'src/app/services/water.service';
import { WaterFile } from '../water-file.model';

@Component({
  selector: 'app-water-files',
  templateUrl: './water-files.component.html',
  styleUrls: ['./water-files.component.css']
})
export class WaterFilesComponent implements OnInit {

  descriptionText: string = `Στο πεδίο "Aρχεία Νερού" μπορείς να βρεις/προσθέσεις τα εξής:`;
  items: string[] = ['Λίστα προσωπικού', 'Λογαριασμός υδροδότησης', 'Ανάλυση νερού', 'Καταλληλότητα πάγου'];

  menu: WaterFile[] = [];
  subscription: Subscription;

  constructor(
    private service: WaterService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.fetchFiles();
  }

  fetchFiles() {
    this.service.loadByCategory('water-files').subscribe(headers => {
      this.service.loadHeadersByMenuId(headers[0].id).subscribe(menu => {
        this.menu = menu;
        if (menu.length > 0) {
          this.service.selectedTabTitle$.next(menu[0].title || '');
          this.fileUploadService.setMenuCategoryAndSubCategory(0, 'water-files');
          this.fileUploadService.getFilesByCategory('water-files');
        }
      });
    });
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    const title = this.menu[tabChangeEvent.index]?.title || '';
    this.service.selectedTabTitle$.next(title);
    this.fileUploadService.setMenuCategoryAndSubCategory(tabChangeEvent.index, 'water-files');
    this.fileUploadService.getFilesByCategory('water-files');
  }

}
