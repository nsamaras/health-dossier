import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { BusinessFile } from "../business/business-file.model";
import { Menu } from "../model/menu";
import { StaffFile } from "../staff/staff-file.model";
import { convertSnaps } from "./db-utils";

@Injectable({
  providedIn: "root"
})
export class StaffService {
  
  filesChanged = new Subject<StaffFile[]>();    
  private files: StaffFile []  = [];
  fileSelected = new Subject<StaffFile>();

  constructor(private db: AngularFirestore) { }

  getBusinessFiles() {
      return this.files.slice(); 
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
                  map(result => convertSnaps<StaffFile>(result))
              );
  }
}