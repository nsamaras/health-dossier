import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction, DocumentData, DocumentSnapshot } from "@angular/fire/compat/firestore";
import { UserService } from "./user.service";
import { catchError, concatMap, map, switchMap, tap } from "rxjs/operators";
import { convertSnaps } from "./db-utils";
import { AllergenicInstanceModel } from '../allergenic/allergenic.model';
import { from, Observable, of, Subject, forkJoin, throwError } from 'rxjs';
import { AllergenicProductModel } from '../allergenic/allergenic-product.model';
import Swal from 'sweetalert2';
import firebase from 'firebase/compat/app';
import { AllergenicEntity } from '../allergenic/allergenic-entity';
import { AllergenicProductEntity } from '../allergenic/allergenic-product-entity';

@Injectable({
  providedIn: 'root'
})
export class AllergenicService {
  allergenicData: AllergenicInstanceModel[];
  items: Observable<any[]>;

  document: any;
  subcollections: any[];
  allergenicProducts: any[] = [];

  constructor(private db: AngularFirestore,
    private userService: UserService,
    private afs: AngularFirestore) { 
      
    }

  getDefaultAllergenicData(): Observable<AllergenicInstanceModel[]>{
    this.loadAllergenicDataByUrid();
    return this.db.collection('allergenic',
           ref => ref
           .orderBy("seqOrder"))
           .get()
           .pipe(
             map(result => convertSnaps<AllergenicInstanceModel>(result))
           )
  }

  getAllergenicDataByUrid() {
    const urid = this.userService.getUserId();
    if (!urid) return Promise.resolve(null);
   return this.db.doc("/allergenic-data/"+urid).ref.get()
  }


loadAllergenicDataByUrid() {
  const urid = this.userService.getUserId();
  if (!urid) return of(null);
  return this.db.doc("/allergenic-data/"+urid).valueChanges();
}

getItems(): Observable<any[]> {
  return new Observable<any[]>(observer => {
    observer.next(this.allergenicProducts);
    observer.complete();
  });
}

  onSaveAllerginicData(allProd: AllergenicEntity, product: string) {
    const urid = this.userService.getUserId();
    const docRef = this.db.collection('allergenic-data').doc(`${urid}`).ref;
    const result = Observable
    docRef.get().then(doc => {
      if(doc.exists) {
        from(this.db.collection('allergenic-data')
                .doc(`${urid}`)
                .update(Object.assign({}, allProd)))
                .pipe(
                  tap(() => {
                    Swal.fire(
                      'Good job!',
                      product + ' αποθηκεύτηκε με επιτυχία !!!',
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
                ).subscribe();
      } else {
        from(this.db.collection('allergenic-data')
                .doc(`${urid}`)
                .set(Object.assign({}, allProd)))
                .pipe(
                  tap(() => {
                    Swal.fire(
                      'Good job!',
                      product + ' ανανεώθηκε με επιτυχία !!!' ,
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
                ).subscribe();
      }
      
    });
  } 
    
  deleteProduct(product:AllergenicProductModel) {
      const urid = this.userService.getUserId();
      this.db.doc(`allergenic-data/${urid}`)
      .update({ 
        [product.productName]: firebase.firestore.FieldValue.delete()
      }).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: product.productName +' διεγράφει με επιτυχία!',
        });
      })
      .catch(error => {
        console.error('Error updating document: ', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
      });
  }

  mapDocToTypeScriptObject(doc: any): Doc {
    const tsObject: Doc = {
        id: doc.id,
        data: doc.data(),
    };
    return tsObject;
  }

  mapDocToTypeScriptObj(doc: Obj): Obj {
    const tsObject: Obj = {
      name: doc.name,
      isChecked: doc.isChecked,
    };
    return tsObject;
  }

}

interface Doc {
  id: number;
  data: AllergenicProductEntity;
}

interface Obj {
  name: string;
  isChecked: boolean;
}