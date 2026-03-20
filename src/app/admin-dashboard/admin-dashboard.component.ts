import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { UserModel } from '../auth/user.model';
import { FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { convertSnaps } from '../services/db-utils';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  users: any[] = [];
  selectedUser: any = {};
  selected = new FormControl();
  updatedStatus: any = this.selectedUser.isActive;

  constructor(private userService: UserService, private db: AngularFirestore) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  onUserSelect(event: Event): void {
    const selectedUserUrid = (event.target as HTMLSelectElement).value;
    this.db.collection('users',
      ref => ref
      .where("urid", "==", selectedUserUrid))
      .get().pipe(
        map(result => convertSnaps<UserModel>(result))        
    ).subscribe(
      user => {
          this.selectedUser.name = user[0].name;   
          this.selectedUser.email =   user[0].email;
          this.selectedUser.isActive =   user[0].isActive;
          this.selectedUser.urid =   user[0].urid;
          this.updatedStatus = user[0].isActive;
          this.userService.setEditUserUrid(selectedUserUrid); 
        })
  }

  submitValue(): void {
      const updateUser: UserModel = {
        urid: this.selectedUser.urid, 
        email: this.selectedUser.email,
        name: this.selectedUser.name,                        
        isActive: Boolean(this.updatedStatus),
        isAdmin: false
    }
    if(this.updatedStatus === true || this.updatedStatus === "true") {
      updateUser.isActive =  true;
    } else {
      updateUser.isActive =  false;
    }
    this.userService.updateUser(updateUser);
  }

}
