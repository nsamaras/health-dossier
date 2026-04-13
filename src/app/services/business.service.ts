import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { BusinessFile } from "../business/business-file.model";
import { map } from "rxjs/operators";
import { convertSnaps } from "./db-utils";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Menu } from "../model/menu";

@Injectable({
    providedIn: "root"
})
export class BusinessService {

    bsFilesChanged = new Subject<BusinessFile[]>();    
    private files: BusinessFile []  = [];
    fileSelected = new Subject<BusinessFile>();
   

    constructor(private db: AngularFirestore) {
    }

    getBusinessFiles() {
        return this.files.slice(); 
    }

    setBusinessFiles(bsFiles: BusinessFile[]) {
      this.files = bsFiles;
      this.bsFilesChanged.next(this.files.slice())
    }

    addBussinessFiles(bsFiles: BusinessFile) {
      this.files.push(bsFiles);
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

    loadBySeqNo(seqNo: number): Observable <Menu[]> {
        return this.db.collection("menu",
                     ref => ref.where("seqNo", "==", seqNo))
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
                    map(result => convertSnaps<BusinessFile>(result))
                );
    }
}