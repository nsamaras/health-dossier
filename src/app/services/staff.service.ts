import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Menu } from "../model/menu";
import { StaffFile } from "../staff/staff-file.model";
import { convertSnaps } from "./db-utils";
import firebase from 'firebase/compat/app';
import Timestamp = firebase.firestore.Timestamp;

@Injectable({ providedIn: "root" })
export class StaffService {

  filesChanged  = new Subject<StaffFile[]>();
  fileSelected  = new Subject<StaffFile>();
  private files: StaffFile[] = [];

  /** Tracks the title of the currently active staff tab */
  selectedTabTitle$ = new BehaviorSubject<string>('');

  constructor(private db: AngularFirestore) {}

  getBusinessFiles() { return this.files.slice(); }

  loadByCategory(category: string): Observable<Menu[]> {
    return this.db.collection("menu",
      ref => ref.where("category", "==", category).orderBy("seqNo"))
      .get()
      .pipe(map(result => convertSnaps<Menu>(result)));
  }

  loadHeadersByMenuId(id: any) {
    return this.db.collection('/menu/' + id + '/headers',
      ref => ref.orderBy("seqNo"))
      .get()
      .pipe(map(result => convertSnaps<StaffFile>(result)));
  }

  saveHealthCertExpiry(urid: string, expiryDate: Date): Promise<void> {
    return this.db.collection('staff-certifications').doc(urid).set(
      { healthCertExpiryDate: Timestamp.fromDate(expiryDate) },
      { merge: true }
    );
  }

  loadHealthCertExpiry(urid: string): Observable<Date | null> {
    return this.db.collection('staff-certifications').doc(urid).get().pipe(
      map(doc => {
        if (!doc.exists) return null;
        const data = doc.data() as any;
        return data?.healthCertExpiryDate
          ? (data.healthCertExpiryDate as Timestamp).toDate()
          : null;
      })
    );
  }
}