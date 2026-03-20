import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {catchError, concatMap, last, map, take, tap} from 'rxjs/operators';
import {from, Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import { TemperatureModel } from '../temperature.model';
import { TemperatureService } from 'src/app/services/temperature.service';
import { UserService } from 'src/app/services/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-temperature',
  templateUrl: './add-temperature.component.html',
  styleUrls: ['./add-temperature.component.css']
})
export class AddTemperatureComponent implements OnInit {

  maxDate = new Date();
  isHidden: boolean = true;
  @Input() visible: string

  form = this.fb.group({
    name: ['', Validators.required],    
    category: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, 
              private temperatureService: TemperatureService,
              private router: Router,
              private userService: UserService,
              private dialogRef: MatDialogRef<AddTemperatureComponent>,
              private afs: AngularFirestore) { }

  ngOnInit(): void {
  }

  saveCategory() {
    const val = this.form.value;
    const newTemp: Partial<TemperatureModel> = {
      name: val.name,      
      category: val.category,      
      urid: this.userService.getUserId(),
      docId: this.afs.createId(),
    }
   
    this.temperatureService.saveTemperature(newTemp)
                  .pipe(
                      tap(tmp => {
                        Swal.fire('Επιτυχημενή εγγραφή ', 'success');
                        this.router.navigateByUrl("/temperatures-profile")
                        this.close();
                      }),
                      catchError(err => {
                        console.log(err);
                        alert("Could not insert the tmt ")
                        return throwError(err)
                      })
                  )
                  .subscribe();
  }

  editValues() {
    
  }

  close() {
    this.dialogRef.close();
  }

}
