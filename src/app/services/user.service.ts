import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { loggedIn } from "@angular/fire/compat/auth-guard";
import { Router } from "@angular/router";
import { BehaviorSubject, from, Observable, throwError } from "rxjs";
import { catchError, first, map, tap } from "rxjs/operators";
import { UserModel } from "../auth/user.model";
import { UserRoles } from "../model/user-roles";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { convertSnaps } from "./db-utils";
import { Menu } from "../model/menu";
import { User } from "../model/user";
import { of } from 'rxjs'
import Swal from "sweetalert2";

@Injectable({
    providedIn: "root"
})
export class UserService {

    isLoggedIn$: Observable<boolean>;
    isLoggedOut$: Observable<boolean>;
    roles$: Observable<UserRoles>;
    user$: Observable<UserModel>;
    emailUser$: Observable<string>;
    loginMessage = '';
    user: UserModel;
    userData: any;
    editUserId: string;

    isActiveUser$ = new BehaviorSubject<boolean>(false);
    isAdminUser$ = new BehaviorSubject<boolean>(false);

    get isActiveUser() { return this.isActiveUser$.value; }
    get isAdminUser() { return this.isAdminUser$.value; }

    constructor(private afAuth: AngularFireAuth, 
                private router: Router,
                private db: AngularFirestore) {
        this.isLoggedIn$ = afAuth.authState.pipe(map(user => !!user));
        this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
        this.isActiveUser$.next(false);
        this.isAdminUser$.next(false);

        afAuth.authState.subscribe(user => {
            if (user) {
                this.setUser();
            } else {
                this.isActiveUser$.next(false);
                this.isAdminUser$.next(false);
                this.loginMessage = '';
            }
        });
    }

    getUserByUrid(urid: string) {
        this.isActiveUser$.next(false);
        this.isAdminUser$.next(false);
        return this.db.collection('users',
                ref => ref
                .where("urid", "==", urid))
                .get()
                .pipe(
                    map(result => convertSnaps<UserModel>(result))
                )
    }

    logout() {
        this.afAuth.signOut();
        this.router.navigate(['/auth']);   
    }

    setUser() {   
        this.afAuth.currentUser
            .then((userCredential) => {    
        this.getUserByUrid(userCredential.uid)
            .subscribe(result => {      
                if(result.length == 0) {
                    const newUser: UserModel = {
                        urid: userCredential.uid, 
                        email: userCredential.email,
                        name: userCredential.displayName,                        
                        isActive: false,
                        isAdmin: false,
                        phoneNumber: '',
                        vat: ''
                    }
                    this.saveUser(newUser)
                        .pipe(
                          tap(() => {
                            Swal.fire(
                              'Γεία σου νέε χρηστη ' + userCredential.displayName,
                              'success'
                            )
                          }),
                          catchError(err => {
                            Swal.fire({
                              icon: 'error',
                              title: 'Oops...',
                              text: 'Something went wrong!'
                            })
                            return throwError(err)
                          })
                      )
                      .subscribe();
                 
                } else {
                    this.user = new UserModel(result[0].urid, result[0].email, result[0].name, result[0].isActive, result[0].isAdmin, result[0].phoneNumber, result[0].vat);
                    this.loginMessage = ' Γεία σου ' + result[0].name;
                    this.isActiveUser$.next(result[0].isActive);
                    this.isAdminUser$.next(result[0].isAdmin);
                }
                });
            }
        )
        .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
        });     
    }

    getUserId() { 
        if(this.user === undefined) {
            this.logout()
        } else if(this.user.isAdmin) {
            return this.editUserId;
        }
        else {
            return this.user.urid;
        }          
    }

    setUserId(userId: string) { 
        if(this.user === undefined) {
            this.logout()
        } else {
            return this.user.urid = userId;
        }          
    }

    setEditUserUrid(userId: string) {
        this.editUserId = userId;
    }

    loadUserRole(uid: string) : Observable <UserModel[]>{  
         return this.db.collection("users",
                     ref => ref
                     .where("uid", "==", uid))
                     .get()
                     .pipe(
                         map(result => convertSnaps<UserModel>(result))
                     );
    }    

    saveUser(newUser: UserModel) {
            return  from(this.db.collection('users/').doc(`${newUser.urid}`).set(Object.assign({}, newUser)))
                    .pipe(
                        map(res => {
                            return {
                              ...newUser
                            }
                    }))
    }

  
    async updateUserProfile(email: string, name: string) {
        const user = await this.afAuth.currentUser;
        if (user) {
            await user.updateEmail(email);
            console.log('Authentication email updated');
          } else {
            throw new Error('No user logged in');
          }
        this.db.collection('users').doc(this.user.urid).update({
            email: email,
            name: name
          }).then(() => {
            Swal.fire({
                text: `Ο χρήστης ανανεώθηκε με επιτυχία!`,
                icon: 'success',
                confirmButtonText: 'OK'
              });
          }).catch(error => {
            Swal.fire({
                title: 'Error',
                text: `Failed to update user: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Try Again'
              });
          });
    }

    async updateUserProfile2(email: string, name: string) {
        try {
          const user = await this.afAuth.currentUser;
          if (!user) {
            throw new Error('No user logged in');
          }
      
          await user.updateEmail(email);
          console.log('Authentication email updated');
      
          await this.db.collection('users').doc(this.user.urid).update({
            email: email,
            name: name
          });
      
          Swal.fire({
            text: 'Ο χρήστης ανανεώθηκε με επιτυχία!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
      
        } catch (error: any) {
          Swal.fire({
            title: 'Σφάλμα',
            text: `Αποτυχία ενημέρωσης χρήστη: ${error.message || error}`,
            icon: 'error',
            confirmButtonText: 'Προσπάθησε ξανά'
          });
        }
      }

    updateUser(updateUser: Partial<UserModel>) : Promise<void>{
        return this.db.collection('users').doc(updateUser.urid).update(updateUser).then(() => {
            Swal.fire({
              text: 'Ο χρήστης ανανεώθηκε με επιτυχία!',
              icon: 'success',
              confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.setEditUserUrid(updateUser.urid);
                  } 
            });
          })
          .catch((error) => {
            Swal.fire({
              title: 'Error',
              text: `Failed to update user: ${error.message}`,
              icon: 'error',
              confirmButtonText: 'Try Again'
            });
          });;
    }

    getUsers(): Observable<any[]> {
        return this.db.collection('users', ref => ref.orderBy('email')).valueChanges();
      }

    updateUserFieldsSilent(urid: string, phoneNumber: string, vat: string): Promise<void> {
        return this.db.collection('users').doc(urid).update({ phoneNumber, vat });
    }

    async updateUserProfileFull(email: string, name: string, phoneNumber: string, vat: string) {
        try {
            const user = await this.afAuth.currentUser;
            if (!user) throw new Error('No user logged in');

            await user.updateEmail(email);

            await this.db.collection('users').doc(this.user.urid).update({
                email, name, phoneNumber, vat
            });

            // Keep in-memory model in sync
            this.user.email       = email;
            this.user.name        = name;
            this.user.phoneNumber = phoneNumber;
            this.user.vat         = vat;

            Swal.fire({ text: 'Ο χρήστης ανανεώθηκε με επιτυχία!', icon: 'success', confirmButtonText: 'OK' });
        } catch (error: any) {
            Swal.fire({ title: 'Σφάλμα', text: `Αποτυχία ενημέρωσης: ${error.message || error}`, icon: 'error', confirmButtonText: 'Προσπάθησε ξανά' });
        }
    }
}