import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BusinessFile } from 'src/app/business/business-file.model';
import { UploadListComponent } from 'src/app/file-upload/upload-list/upload-list.component';
import { StaffFile } from '../staff-file.model';
import { Subscription } from 'rxjs';
import { StaffService } from 'src/app/services/staff.service';

@Component({
  selector: 'app-staff-file-details',
  templateUrl: './staff-file-details.component.html',
  styleUrls: ['./staff-file-details.component.css']
})
export class StaffFileDetailsComponent implements OnInit, OnDestroy {

  @Input() file: BusinessFile

  @ViewChild(UploadListComponent) uploadListComponent;

  showUploadForm = true;
  private sub: Subscription;

  constructor(private staffService: StaffService) { }

  ngOnInit(): void {    
    this.sub = this.staffService.selectedTabTitle$.subscribe(title => {
      this.showUploadForm = title !== 'Πιστοποιητικά υγείας' && title !== 'Εκπαιδεύσεις προσωπικού';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
