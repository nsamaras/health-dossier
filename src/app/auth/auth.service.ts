import { Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, Observable, Subject, throwError } from "rxjs";
import { Router } from "@angular/router";
import { UserModel } from "./user.model";

import * as firebaseui from 'firebaseui';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import EmailAuthProvider = firebase.auth.EmailAuthProvider;
// import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { map } from 'rxjs/operators';
import { UserService } from "../services/user.service";
 
export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: string;
    userUID: string;
}


@Injectable({providedIn: 'root'})
export class AuthService {

    user = new BehaviorSubject<UserModel>(null);
    user$: Observable<any>;
    
    ui: firebaseui.auth.AuthUI;

    testUser$: Observable<UserModel>;

    constructor(private afAuth: AngularFireAuth,
                private afs: AngularFirestore,
                private router: Router,
                private db: AngularFireDatabase, private userService:  UserService) {
               // Get the authentication state
        this.user$ = this.afAuth.authState.pipe(
            map(user => !!user) // Return true if a user is logged in, false otherwise
        );   
    }

    login() {
        this.afAuth.app.then(app => {
            const uiConfig = {
                signInOptions: [EmailAuthProvider.PROVIDER_ID,
                                 //GoogleAuthProvider.PROVIDER_ID   
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
    }

     isAuthenticated(): Observable<boolean> {
        return new Observable<boolean>(observer => {
            this.afAuth.currentUser
                .then(userCredential => {
                    if (!userCredential) {
                        observer.next(false); // No user, return false
                        observer.complete();
                        return;
                    }
                    this.userService.getUserByUrid(userCredential.uid).subscribe(user => {
                        observer.next(!!(user.length && user[0].isActive)); // Ensure boolean result
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
                })
                .catch(error => {
                    observer.error(error);
                });
        });
     }
}

