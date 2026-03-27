import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Menu } from "../model/menu";
import { WaterFile } from "../water/water-file.model";
import { convertSnaps } from "./db-utils";

@Injectable({
    providedIn: "root"
  })
export class WaterService {
    
  filesChanged = new Subject<WaterFile[]>();    
  fileSelected = new Subject<WaterFile>();

  /** Tracks the title of the currently active water tab */
  selectedTabTitle$ = new BehaviorSubject<string>('');

  constructor(private db: AngularFirestore) { }

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
                  map(result => convertSnaps<WaterFile>(result))
              );
  }
}