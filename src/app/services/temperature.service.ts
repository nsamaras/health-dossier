import { EventEmitter, Injectable } from "@angular/core";
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { AuthService } from "../auth/auth.service";
import { TemperatureModel } from "../temperature/temperature.model";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { concatMap, map } from "rxjs/operators";
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;
import { UserService } from "./user.service";
import { convertSnaps } from "./db-utils";
import {formatDate} from '@angular/common';

@Injectable({
  providedIn: "root"
})
export class TemperatureService {

  temperatures: any[]
  temperaturesChanged = new Subject<any[]>();

  constructor(private db: AngularFirestore,
              private userService: UserService) {}

 
  getFridgesByDate(date: Timestamp) {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/FRIDGES-BY-DATE`,
           ref => ref
           .where("date", "==",date)
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  getFridgesList() {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/FRIDGES-LIST`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  getCombinedFridges(date: Timestamp) {
    return forkJoin([
      this.getFridgesByDate(date),
      this.getFridgesList()
    ]).pipe(
      map(([list1, list2]) => {
        // Create a Set of names from list1 to track existing items
      const list1Names = new Set(list1.map(fridge => fridge.name));
      // Filter list2 to get only the values that do not exist in list1
      const uniqueFromList2 = list2.filter(fridge => !list1Names.has(fridge.name));
      // Merge list1 with the filtered values from list2
      return [...list1, ...uniqueFromList2];
      })
    );
  }

  getCombinedFreezers(date: Timestamp) {
    return forkJoin([
      this.getFreezersByDate(date),
      this.getFreezersList()
    ]).pipe(
      map(([list1, list2]) => {
        // Create a Set of names from list1 to track existing items
      const list1Names = new Set(list1.map(fridge => fridge.name));
      // Filter list2 to get only the values that do not exist in list1
      const uniqueFromList2 = list2.filter(fridge => !list1Names.has(fridge.name));
      // Merge list1 with the filtered values from list2
      return [...list1, ...uniqueFromList2];
      })
    );
  }

  getCombinedHots(date: Timestamp) {
    return forkJoin([
      this.getHotsByDate(date),
      this.getHotsList()
    ]).pipe(
      map(([list1, list2]) => {
        // Create a Set of names from list1 to track existing items
      const list1Names = new Set(list1.map(fridge => fridge.name));
      // Filter list2 to get only the values that do not exist in list1
      const uniqueFromList2 = list2.filter(fridge => !list1Names.has(fridge.name));
      // Merge list1 with the filtered values from list2
      return [...list1, ...uniqueFromList2];
      })
    );
  }

  getCombinedCooked(date: Timestamp) {
    return forkJoin([
      this.getCookedByDate(date),
      this.getCookedList()
    ]).pipe(
      map(([list1, list2]) => {
        // Create a Set of names from list1 to track existing items
      const list1Names = new Set(list1.map(fridge => fridge.name));
      // Filter list2 to get only the values that do not exist in list1
      const uniqueFromList2 = list2.filter(fridge => !list1Names.has(fridge.name));
      // Merge list1 with the filtered values from list2
      return [...list1, ...uniqueFromList2];
      })
    );
  }

  getFreezersList() {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/FREEZERS-LIST`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  getHotsList() {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/HOTS-LIST`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  getCookedList() {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/COOKED-LIST`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }
  

  getFreezersByDate(date: Timestamp) {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/FREEZERS-BY-DATE`,
           ref => ref
           .where("date", "==",date)
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  getHotsByDate(date: Timestamp) {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/HOTS-BY-DATE`,
           ref => ref
           .where("date", "==",date)
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }


  getCookedByDate(date: Timestamp) {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/COOKED-BY-DATE`,
           ref => ref
           .where("date", "==",date)
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }
  

  getFridges() {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/FRIDGES`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }
  
  getFreezers() {
    var urid = this.userService.getUserId()
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/FREEZERS`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  getHots() {
    var urid = this.userService.getUserId()
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/HOTS`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  getCooked() {
    var urid = this.userService.getUserId()
    if (!urid) return of([]);
    return this.db.collection(`temperatures/${urid}/COOKED`,
           ref => ref
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }


  getTemperaturesByDocIdAndName(docId: string, category: string, name: string) {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection('temperatures/')
          .doc(`${urid}`)
          .collection(`${category}`,
           ref => ref
           .where("urid", "==", this.userService.getUserId())
           .where("category", "==", category)
           .where("docId", "==", docId)
           .where("name", "==", name)
           )
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  

  saveTemperature(newTemperature: Partial<TemperatureModel>) {
    var urid = this.userService.getUserId();
    if (newTemperature.name !== null && newTemperature.name !== "") {
      return  from(this.db.collection('temperatures/')
        .doc(`${urid}`)
        .collection(`${newTemperature.category}`)
        .doc(newTemperature.docId)
        .set(newTemperature))
              .pipe(
                  map(res => {
                      return {
                        ...newTemperature
                      }
              }))
    }
    
  }

  saveNewFridgeFreezerCooked(newTemperature: Partial<TemperatureModel>) {
    var urid = this.userService.getUserId();
    return  from(this.db.collection('temperatures/')
      .doc(`${urid}`)
      .collection(`${newTemperature.category}-LIST`)
      .doc(newTemperature.docId)
      .set(newTemperature))
            .pipe(
                map(res => {
                    return {
                      ...newTemperature
                    }
            }))
  }

  updateTemperature(docId: string, category: string, changes: Partial<TemperatureModel>) : Observable<any> {
    var urid = this.userService.getUserId();
    return from(this.db.collection('temperatures/').doc(`${urid}`).collection(`${category}`).doc(`${docId}`).update(changes));
  }

  delteTemperature(docId: string, name: string, category: string, listName: string) {
    var urid = this.userService.getUserId();
    // from(this.db.collection('temperatures/').doc(`${urid}`).collection(`${category}`).doc(`${docId}`).delete());
    this.db.collection('temperatures/')
          .doc(`${urid}`)
          .collection(`${listName}`,
           ref => ref
           .where("name", "==", name))
           .get()
           .subscribe(querySnapshot => {
            querySnapshot.forEach(doc => {
              this.db.doc(`temperatures/${urid}/${listName}/${doc.id}`).delete()
                .then(() => console.log(`Deleted document ID: ${doc.id}`))
                .catch(error => console.error("Error deleting document: ", error));
            });
          });
    return  from(this.db.collection('temperatures/').doc(`${urid}`).collection(`${category}`).doc(`${docId}`).delete());
  }

  delteCookedList() {
    var urid = this.userService.getUserId();    
    this.db.collection('temperatures/').doc(`${urid}`).collection(`COOKED-LIST`)
          .get()
          .subscribe(snapshot => {
            snapshot.forEach(doc => {
              this.db.collection('temperatures/').doc(`${urid}`).collection(`COOKED-LIST`).doc(doc.id).delete()              
            });
      })
  }

  transform(timestamp: Timestamp, format?: string): string {
    if (!timestamp?.toDate) { 
      return;
    }
    return formatDate(timestamp.toDate(), format || 'medium', 'en-us');
  }

  onExportPdf(from: Timestamp, to: Timestamp, category: string) {
    var urid = this.userService.getUserId();
    if (!urid) return of([]);
    return this.db.collection('temperatures/').doc(`${urid}`).collection(`${category}`,
           ref => ref
           .where("date", ">=", from)
           .where("date", "<=", to)
           .where("category", "==", category)
           .orderBy("date", 'asc')
           .orderBy("name")
           )
           .get()
           .pipe(
             map(result => convertSnaps<TemperatureModel>(result))
           )
  }

  deleleteCategoryFromProfile(docId: string, category: string) {
    var urid = this.userService.getUserId();
    return  from(this.db.collection('temperatures/').doc(`${urid}`).collection(`${category}`).doc(`${docId}`).delete());
  }

  updateCategoryFromProfile(docId: string, category: string, changes: Partial<TemperatureModel>) : Observable<any> {
    var urid = this.userService.getUserId();
    return from(this.db.collection('temperatures/').doc(`${urid}`).collection(`${category}`).doc(`${docId}`).update(changes));
  }
}