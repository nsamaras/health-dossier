import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import { UserService } from '../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { UserModel } from '../auth/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserComponent>,
    private afs: AngularFirestore) { }

  ngOnInit(): void {
  }

  maxDate = new Date();
  
  form = this.fb.group({
    name: [this.userService.user.name, Validators.required],
    email: [this.userService.user.email, Validators.required],
    password: ['', Validators.required],
    confirm_password: ['', Validators.required]
  });

 

  close() {
    this.dialogRef.close();
  }

  save() {
    this.userService.updateUserProfile2(this.form.value.email, this.form.value.name);
    this.dialogRef.close();
  }

}
