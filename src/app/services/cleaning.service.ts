import { EventEmitter, Injectable } from "@angular/core";
import { from, Observable, Subject } from 'rxjs';
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { AuthService } from "../auth/auth.service";
import { TemperatureModel } from "../temperature/temperature.model";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { concatMap, map } from "rxjs/operators";
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import { convertSnaps } from "./db-utils";
import { CleaningModel } from "../cleaning-disinfection/cleaning.model";
import { UserService } from "./user.service";
import {formatDate} from '@angular/common';
import { Menu } from "../model/menu";
import { CleaningFile } from "../cleaning-disinfection/cleaning-file.model";

@Injectable({
    providedIn: "root"
  })
  export class CleaningService {

    constructor(private db: AngularFirestore,
      private userService: UserService) {}

    getCleaningData() {
        return this.db.collection('cleaning',
               ref => ref
               .orderBy("name"))
               .get()
               .pipe(
                 map(result => convertSnaps<CleaningModel>(result))
               )
      }

      loadByCategory(category: string): Observable <Menu[]> {
        return this.db.collection("menu",
                     ref => ref.where("category", "==", category) 
                     .orderBy("seqNo"))
                     .get()
                     .pipe(
                         map(result => convertSnaps<Menu>(result))
                     );
    }

    loadHeadersByMenuId(id: any) {
      return this.db.collection(               
          '/menu/'+id+'/headers',
          ref => ref.orderBy("seqNo"))
          .get()
          .pipe(
              map(result => convertSnaps<CleaningFile>(result))
          );
}

      saveCleaningData(cleaningModel: Partial<CleaningModel>, docId: string) : Observable<any> {
        const urid = this.userService.getUserId();
        return  from(this.db.collection('cleaning/').doc(`${urid}`).collection('DATA').doc(`${docId}`).set(cleaningModel))
            .pipe(
                map(res => {
                    return {  
                      ...cleaningModel
                    }
            }))
      }

      updateCleaningData(cleaningModel: Partial<CleaningModel>) {
        const urid = this.userService.getUserId();
        const docId = cleaningModel.docId;
        return from(this.db.collection('cleaning/').doc(`${urid}`).collection('DATA').doc(`${docId}`).update(cleaningModel));
      }

      getCleaningByDate(date: Timestamp) {
        console.log('date: ',date)
        var urid = this.userService.getUserId();
        return this.db.collection('cleaning/').doc(`${urid}`).collection('DATA',
               ref => ref
               .where("date", "==", date)
               .where("urid", "==", urid)
               .orderBy("name"))
               .get()
               .pipe(
                 map(result => convertSnaps<CleaningModel>(result))
               )
      }

      onDeleteCleaning(id: string) {
        var urid = this.userService.getUserId();
        return from(this.db.collection('cleaning/').doc(`${urid}`).collection('DATA').doc('2Hj03dZQ6AZmivYDVoLB').delete());
      }

      onExportPdf(from: Timestamp, to: Timestamp) {
        var urid = this.userService.getUserId();
        return this.db.collection('cleaning/').doc(`${urid}`).collection('DATA',
               ref => ref
               .where("date", ">=", from)
               .where("date", "<=", to)
               .where("urid", "==", urid)
               .orderBy("date")
               .orderBy("name")
               )
               .get()
               .pipe(
                 map(result => convertSnaps<CleaningModel>(result))
               )
      }

  }