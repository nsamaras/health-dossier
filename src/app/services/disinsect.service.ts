import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { DisinsectFile } from "../disinsect/disinsect-file.model";
import { Menu } from "../model/menu";
import { convertSnaps } from "./db-utils";

@Injectable({
  providedIn: "root"
})
export class DisinsectService {
    
  filesChanged = new Subject<DisinsectFile[]>();    
  fileSelected = new Subject<DisinsectFile>();

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
                  map(result => convertSnaps<DisinsectFile>(result))
              );
  }
}