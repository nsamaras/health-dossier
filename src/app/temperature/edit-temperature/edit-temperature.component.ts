import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { TemperatureService } from 'src/app/services/temperature.service';
import { TemperatureModel } from '../temperature.model';

@Component({
  selector: 'app-edit-temperature',
  templateUrl: './edit-temperature.component.html',
  styleUrls: ['./edit-temperature.component.css']
})
export class EditTemperatureComponent implements OnInit {

  form: FormGroup;
  temperature: TemperatureModel;
  private temperatureChangeSub: Subscription;

  constructor(private dialogRef: MatDialogRef<EditTemperatureComponent>,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) temperature: TemperatureModel,
              private temperatureService: TemperatureService) { 
      this.temperature = temperature;
      this.form = this.fb.group({
        name: [temperature.name, Validators.required],
        temperatureMorning: [temperature.temperatureMorning],
        temperaturAfternoon: [temperature.temperatureAfternoon],
      })
    }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    const changes = this.form.value;
    this.temperatureService.updateTemperature(this.temperature.docId, this.temperature.category, changes)
      .subscribe( () => {
          this.dialogRef.close(changes);
      })
  }
}