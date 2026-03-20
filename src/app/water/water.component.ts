import { Component, OnInit } from '@angular/core';
import { WaterService } from '../services/water.service';
import { WaterFile } from './water-file.model';

@Component({
  selector: 'app-water',
  templateUrl: './water.component.html',
  styleUrls: ['./water.component.css']
})
export class WaterComponent implements OnInit {

  selectedFile: WaterFile;

  constructor(private service: WaterService) { }

  ngOnInit(): void {
    this.service.fileSelected.subscribe(
      (staffFile : WaterFile) => {
        this.selectedFile = staffFile;
      }
    );
  }

}
