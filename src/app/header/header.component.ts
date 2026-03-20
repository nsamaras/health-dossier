import { Component, OnDestroy, OnInit } from '@angular/core';
// import { AuthService } from '../auth/auth.service';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { AuthService } from '../auth/auth.service';
import { UserService } from '../services/user.service';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { map } from "rxjs/operators";
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isAuthenticated = false;
  private userSub: Subscription;
 

  constructor(private authService: AuthService,
              public user: UserService,
              private afAuth: AngularFireAuth,
              private dialog: MatDialog) { 
   }

  ngOnInit(): void {
  }

  onLogout() {
    this.user.logout();
  }

  editUser() {
    const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.minWidth = "400px";     
      this.dialog.open(UserComponent, dialogConfig)
          .afterClosed()
          .subscribe(() => {
            
          })
  }
}
