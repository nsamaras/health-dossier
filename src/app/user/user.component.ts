import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  form = this.fb.group({
    name:        [this.userService.user?.name  ?? '', Validators.required],
    email:       [this.userService.user?.email ?? '', Validators.required],
    phoneNumber: [(this.userService.user?.phoneNumber ?? '').replace(/^\+30/, ''), Validators.pattern(/^69[0-9]{8}$/)],
    vat:         [this.userService.user?.vat   ?? '', Validators.pattern(/^[0-9]{9}$/)]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserComponent>,
    private afs: AngularFirestore
  ) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.form.invalid) return;
    const { name, email, phoneNumber, vat } = this.form.value;
    const phoneForDb = phoneNumber ? '+30' + phoneNumber : '';
    this.userService.updateUserProfileFull(email, name, phoneForDb, vat);
    this.dialogRef.close();
  }
}
