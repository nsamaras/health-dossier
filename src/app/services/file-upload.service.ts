import { EventEmitter, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/compat';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { from, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { FileUpload } from '../file-upload/file-upload';
import { forkJoin } from 'rxjs';

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

  pushFileToStorageWithDate(fileUpload: FileUpload, expiryDate: Date): Observable<number> {
    fileUpload.expiryDate = expiryDate;
    this.basePath = '/uploads/' + this.userService.getUserId() + '/' + this.category + '/' + this.subCategory;
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url      = downloadURL;
          fileUpload.name     = fileUpload.file.name;
          fileUpload.subCategory = this.subCategory;
          fileUpload.urid     = this.userService.getUserId();
          fileUpload.category = this.category;
          this.saveFileData(fileUpload);
          this.getFiles();
        });
      })
    ).subscribe();
    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUpload): void {
        const data: any = {
          name: fileUpload.name,
          url: fileUpload.url,
          urid: fileUpload.urid,
          category: fileUpload.category,
          subCategory: fileUpload.subCategory
        };
        if (fileUpload.expiryDate) {
          data.expiryDate = fileUpload.expiryDate;
        }
        this.db.collection('uploads').add(data);
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

getDefaultFilesByCategory(category: string, seqNo: number) {
    this.db.collection('default-files',
           ref => ref.where("category", "==", category)
           .where("seqNo", "==", seqNo)
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

getDefaultAndCategoryFiles(category: string, seqNo: number) {
  const uploads$ = this.db.collection('uploads',
    ref => ref.where("category", "==", category)
      .where("subCategory", "==", this.subCategory)
      .where("urid", "==", this.userService.getUserId())
      .orderBy("name"))
    .get()
    .pipe(
      map(result => convertSnaps<FileUpload>(result))
    );

  const defaultFiles$ = this.db.collection('default-files',
    ref => ref.where("category", "==", category)
      .where("seqNo", "==", seqNo)
      .orderBy("name"))
    .get()
    .pipe(
      map(result => convertSnaps<FileUpload>(result))
    );

  forkJoin([uploads$, defaultFiles$])
    .subscribe(([userFiles, defaultFiles]) => {
      const combined = [...userFiles, ...defaultFiles];

      this.files = combined;
      this.filesChanged.next(combined.slice());
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
    Swal.fire({
      title: 'Διαγραφή αρχείου',
      text: 'Το αρχείο "' + file.name + '" θα διαγραφεί οριστικά. Συνέχεια;',
      icon: 'warning',
      showDenyButton: true,
      confirmButtonText: 'Ναί, διαγραφή',
      denyButtonText: 'Όχι',
    }).then(result => {
      if (!result.isConfirmed) return;

      // Step 1 — delete Firestore document
      this.db.doc(`uploads/${file.id}`).delete()
        .then(() => {
          // Step 2 — delete from Firebase Storage
          const storagePath = `uploads/${file.urid}/${file.category}/${file.subCategory}/${file.name}`;
          return this.storage.ref(storagePath).delete().toPromise();
        })
        .then(() => {
          // Step 3 — refresh list and show success
          this.getFilesByCategory(this.category);
          Swal.fire({
            icon: 'success',
            text: 'Το αρχείο "' + file.name + '" διαγράφηκε επιτυχώς.',
            confirmButtonText: 'OK'
          });
          this.fileDeleted.emit(file);
        })
        .catch(err => {
          Swal.fire({
            icon: 'error',
            title: 'Σφάλμα',
            text: 'Κάτι πήγε στραβά με τη διαγραφή του αρχείου "' + file.name + '".'
          });
          console.error('Delete error:', err);
        });
    });
  }

}


