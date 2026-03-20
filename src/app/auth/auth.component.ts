import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import * as firebaseui from 'firebaseui';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';
import firebase from 'firebase/compat/app';
import EmailAuthProvider = firebase.auth.EmailAuthProvider;
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import { UserModel } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit, OnDestroy {

    ui: firebaseui.auth.AuthUI;
    userModel: UserModel;
    user = new BehaviorSubject<UserModel>(null);

    constructor(private afAuth: AngularFireAuth,
                private router: Router, 
                private userService:  UserService) {
    }

    ngOnInit() {
        this.afAuth.app.then(app => {
            const uiConfig = {
                signInOptions: [
                    EmailAuthProvider.PROVIDER_ID,
                    GoogleAuthProvider.PROVIDER_ID 
                                ],
                callbacks: {
                                signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this)
                            }
            };
            this.ui = new firebaseui.auth.AuthUI(app.auth());   
            this.ui.start("#firebaseui-auth-container", uiConfig);
            this.ui.disableAutoSignIn();           
        });
        
    }

    ngOnDestroy() {
        this.ui.delete();
    }

    onLoginSuccessful(result) {
        this.router.navigateByUrl("/home");
        this.updateUserStatus();
    }

    updateUserStatus() {                  
        this.userService.setUser();
    }
}