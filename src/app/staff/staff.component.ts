import { Component, OnInit } from '@angular/core';
import { StaffService } from '../services/staff.service';
import { StaffFile } from './staff-file.model';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {

  selectedFile: StaffFile;

  constructor(private staffService: StaffService) { }

  ngOnInit(): void {
   
  }

}
