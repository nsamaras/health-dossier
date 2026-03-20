import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Timestamp } from 'rxjs/internal/operators/timestamp';
import { UserService } from 'src/app/services/user.service';
import { AddTemperatureComponent } from 'src/app/temperature/add-temperature/add-temperature.component';
import { TemperatureModel } from 'src/app/temperature/temperature.model';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  maxDate = new Date();

  form = this.fb.group({
    name: ['', Validators.required],
    temperatureMorning: [null],
    temperatureAfternoon: [null],
    category: ['', Validators.required],
    date: [null, Validators.required]
  });

  constructor(private fb: FormBuilder, 
              private router: Router,
              private userService: UserService,
              private dialogRef: MatDialogRef<AddTemperatureComponent>,
              private afs: AngularFirestore) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

}
