import { Component, OnInit } from '@angular/core';
import { DisinsectService } from '../services/disinsect.service';
import { DisinsectFile } from './disinsect-file.model';

@Component({
  selector: 'app-disinsect',
  templateUrl: './disinsect.component.html',
  styleUrls: ['./disinsect.component.css']
})
export class DisinsectComponent implements OnInit {

  selectedFile: DisinsectFile;

  constructor(private service: DisinsectService) { }

  ngOnInit(): void {
    this.service.fileSelected.subscribe(
      (staffFile : DisinsectFile) => {
        this.selectedFile = staffFile;
      }
    );
  }
}
