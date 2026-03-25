import { Component, OnDestroy, OnInit } from '@angular/core';
import * as firebaseui from 'firebaseui';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import EmailAuthProvider = firebase.auth.EmailAuthProvider;
import { UserModel } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { CompleteProfileDialogComponent } from './complete-profile-dialog/complete-profile-dialog.component';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {

    ui: firebaseui.auth.AuthUI;
    userModel: UserModel;
    user = new BehaviorSubject<UserModel>(null);

    constructor(
        private afAuth: AngularFireAuth,
        private router: Router,
        private userService: UserService,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.afAuth.app.then(app => {
            const uiConfig = {
                signInOptions: [EmailAuthProvider.PROVIDER_ID],
                callbacks: {
                    signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this)
                }
            };
            this.ui = new firebaseui.auth.AuthUI(app.auth());
            this.ui.start('#firebaseui-auth-container', uiConfig);
            this.ui.disableAutoSignIn();
        });
    }

    ngOnDestroy() {
        this.ui.delete();
    }

    onLoginSuccessful(result: any): boolean {
        const uid: string = result?.user?.uid;

        this.userService.getUserByUrid(uid).subscribe(users => {
            if (users.length === 0) {
                // New user — open dialog then save
                this.openProfileDialog((phoneNumber, vat) => {
                    const newUser: UserModel = {
                        urid: uid,
                        email: result.user.email,
                        name: result.user.displayName || result.user.email,
                        isActive: false,
                        isAdmin: false,
                        phoneNumber,
                        vat
                    };
                    this.userService.saveUser(newUser).subscribe(() => {
                        this.userService.setUser();
                        this.router.navigateByUrl('/home');
                    });
                });
            } else {
                const dbUser = users[0];
                this.userService.setUser();

                // Existing user — show dialog if phone or vat is missing
                if (!dbUser.phoneNumber || !dbUser.vat) {
                    this.openProfileDialog((phoneNumber, vat) => {
                        this.userService.updateUserFieldsSilent(uid, phoneNumber, vat)
                            .then(() => this.router.navigateByUrl('/home'));
                    });
                } else {
                    this.router.navigateByUrl('/home');
                }
            }
        });

        return false; // prevent Firebase UI from redirecting
    }

    private openProfileDialog(onSave: (phone: string, vat: string) => void): void {
        const dialogRef = this.dialog.open(CompleteProfileDialogComponent, {
            width: '420px',
            disableClose: true
        });
        dialogRef.afterClosed().subscribe(profileData => {
            onSave(profileData?.phoneNumber || '', profileData?.vat || '');
        });
    }

    updateUserStatus() {
        this.userService.setUser();
    }
}