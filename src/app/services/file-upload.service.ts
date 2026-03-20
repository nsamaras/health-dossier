import { EventEmitter, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/compat';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { from, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { FileUpload } from '../file-upload/file-upload';

import 'firebase/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from './user.service';
import { convertSnaps } from './db-utils';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

 private basePath = '/uploads';
 private category: string;
 private subCategory: number;
 files: any[]
 filesChanged = new Subject<any[]>();
 fileDeleted = new EventEmitter<FileUpload>()

  constructor(private db: AngularFirestore, 
              private storage: AngularFireStorage,
              private userService: UserService) {
   }

  pushFileToStorage(fileUpload: FileUpload): Observable<number> { 
    this.basePath = '/uploads/'+this.userService.getUserId()+'/'+this.category+'/'+this.subCategory;
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          fileUpload.subCategory = this.subCategory;
          fileUpload.urid = this.userService.getUserId();
          fileUpload.category = this.category;
          this.saveFileData(fileUpload);
          this.getFiles();
        });
      })
    ).subscribe();
    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
        this.db.collection('uploads').add({
          name: fileUpload.name,
          url: fileUpload.url,
          urid: fileUpload.urid,
          category: fileUpload.category,
          subCategory: fileUpload.subCategory
        });
  }

  removeId(data: any) {
        const newData: any = {...data};
        delete newData.id;
        return newData;
    }

  getFiles(): any {
    this.db.collection('uploads',
           ref => ref.where("category", "==", this.category)
           .where("subCategory", "==", this.subCategory)
           .where("urid", "==", this.userService.getUserId())
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<FileUpload>(result))
           )
           .subscribe(fileUploads => {
             this.files = fileUploads;
            this.filesChanged.next(fileUploads.slice());
          });
          return this.files;
  }
  
  getFilesByCategory(category: string) {
    this.db.collection('uploads',
           ref => ref.where("category", "==", category)
           .where("subCategory", "==", this.subCategory)
           .where("urid", "==", this.userService.getUserId())
           .orderBy("name"))
           .get()
           .pipe(
             map(result => convertSnaps<FileUpload>(result))
           )
           .subscribe(fileUploads => {
             this.files = fileUploads;
             this.filesChanged.next(fileUploads.slice());
          });
 }

 getSuppliersFiles(category: string) {
  this.db.collection('uploads',
         ref => ref.where("category", "==", category)
         .orderBy("name"))
         .get()
         .pipe(
           map(result => convertSnaps<FileUpload>(result))
         )
         .subscribe(fileUploads => {
           this.files = fileUploads;
           this.filesChanged.next(fileUploads.slice());
        });
}

  setMenuCategoryAndSubCategory (index: number, category: string) {
    this.category = category;
    this.subCategory = index;
  }

  deleteFile(file: FileUpload) {
    this.deleteFileId(file.id)
        .pipe(
          tap(() => {
            Swal.fire({
              title: 'Tο αρχείο ' + file.name +' θα διαγραφεί.',
              showDenyButton: true,
              confirmButtonText: 'Ναί',
              denyButtonText: 'Όχι',             
            }).then((result) => {
              if (result.isConfirmed) {
                this.fileDeleted.emit(file);
                this.deleteFileStorage(file)                
              } 
            })
            
          })
        )
        .subscribe();
  }

  private deleteFileStorage(file: FileUpload): void {
    this.storage
        .ref("uploads/"+file.urid+"/"+file.category+"/"+file.subCategory+"/"+file.name)
        .delete().pipe(
          tap(() => {
            Swal.fire(
              ' Tο αρχείο ' + file.name +' διεγράφει με επιτυχία.',              
            )
          }),
          catchError(err => {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Κάτι δεν πηγε καλα με την διαγραφή του αρχείου '+ file.name
            })
            return throwError(err)
          })
        ).subscribe();;
        this.getFiles();
  }
  
  private deleteFileId(fileId: string) {
    return from(this.db.doc(`uploads/${fileId}`).delete());
  }

}


