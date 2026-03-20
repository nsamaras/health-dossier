import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { UserService } from '../services/user.service';
import {from, Observable, Subscription, throwError} from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { EventEmitter, Injectable } from '@angular/core';
import {catchError, filter, map, tap} from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable'
import jsPDF from 'jspdf';
import { ExportService } from '../services/export.service';
import { AllergenicService } from '../services/allergenic.service';
import { AllergenicInstanceModel } from './allergenic.model';
import { AllergenicProductModel } from './allergenic-product.model';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { AllergenicInstance } from './allergenic-instance';
import { AllergenicInstanceInfo } from './allergenic-instance-info';
import { AllergenicEntity } from './allergenic-entity';
import { AllergenicProductEntity } from './allergenic-product-entity';
import { first } from 'rxjs/operators';
import { convertSnaps } from '../services/db-utils';

interface Doc {
  id: number;
  data: AllergenicProductEntity;
}

@Component({
  selector: 'app-allergenic',
  templateUrl: './allergenic.component.html',
  styleUrls: ['./allergenic.component.css']
})
export class AllergenicComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  allChecked: boolean = false;
  allergenicData: AllergenicInstanceModel[];
  allergenic: AllergenicProductModel;
  selectAll: boolean = false;
  allergenicProducts: AllergenicProductModel[] = [];
  allergenicInstance: AllergenicInstance;

  descriptionText : string = `Στο πεδίο “Αλλεργιογόνα” μπορείς να προσθέσεις τα αλλεργιογόνα στοιχεία με βάση το menu σου.`;

constructor(private fb: FormBuilder,
    private router: Router,
    private allergenicService: AllergenicService,
    private userService: UserService,
    private exportService: ExportService) {
}

ngOnInit(): void {
  this.allergenicInstance = new AllergenicInstance();
  this.getAllergenicDataByUrid(); 
}

mapDocToTypeScriptObject(doc: any): Doc {
  const tsObject: Doc = {
      id: doc.id,
      data: doc.data(),
  };
  return tsObject;
}

mapDocToTypeScriptObjectDate(doc: any): Doc {
  const tsObject: Doc = {
      id: doc.id,
      data: doc.data(),
  };
  return tsObject;
}

getAllergenicDataByUrid(){
  this.allergenicService.getAllergenicDataByUrid()
  .then(async (doc: any) => {
    const mappedObject = this.mapDocToTypeScriptObject(doc);
    if(mappedObject.data !== undefined) {
      const arrayOfArrays: [string, AllergenicProductEntity][] = Object.entries(mappedObject.data);
      for (let x = 0; x < arrayOfArrays.length; x++) {
        let allergenicProduct = new AllergenicProductModel();
        allergenicProduct.productName = arrayOfArrays[x][0];
        allergenicProduct.contains = arrayOfArrays[x][1].contains;
        allergenicProduct.ingredients = arrayOfArrays[x][1].ingredients;
        this.allergenicProducts.push(allergenicProduct);
      }
    }
  })
}

getDefaultAllergenicData(newOptionValue: string) {
  const allInstMode:  AllergenicInstanceModel[] = [];
  const allProd = new AllergenicProductModel();
  this.allergenicService.getDefaultAllergenicData().pipe()
  .subscribe(data => { 
    data.forEach(x => {
      allProd.allergenicData = [];
      const allInstance = new AllergenicInstanceModel();
      allProd.productName = newOptionValue;
      allProd.urid = this.userService.getUserId();
      allInstance.name = x.name;
      allInstance.id = x.id;
      allInstance.seqOrder = x.seqOrder
      allInstance.checkedContains = false;
      allInstance.checkedIngredients = false;
      allInstMode.push(allInstance)
      allProd.allergenicData = allInstMode;
    }) 
    this.allergenicProducts.push(allProd);
  })

}

panelOpened(allergenicProduct: AllergenicProductModel) {
  this.allergenicService.loadAllergenicDataByUrid()
  .pipe()
  .subscribe(async (doc: any) => {
    for(const key in doc) {
      if(key === allergenicProduct.productName) {
        allergenicProduct.allergenicData = []
        const allProd = new AllergenicProductModel();
        let allInstance = new AllergenicInstanceModel();
        allProd.productName = allergenicProduct.productName;
        for (let x = 0; x < doc[key].contains.length; x++) {
          allInstance = new AllergenicInstanceModel();
          allInstance.name = Object.keys(doc[key].contains[x])[0];
          if(Object.values(doc[key].contains[x])[0]) {
            allInstance.checkedContains = true;
          }
          if(!Object.values(doc[key].contains[x])[0]) {
            allInstance.checkedContains = false;
          }
          if(Object.values(doc[key].ingredients[x])[0]) {
            allInstance.checkedIngredients = true;
          } 
          if(!Object.values(doc[key].ingredients[x])[0]) {
            allInstance.checkedIngredients = false;
          }
          allergenicProduct.allergenicData.push(allInstance);
        }
    }
    }
  })
}

  addAllergenicProduct(newOptionValue: string): void {
    if (newOptionValue.trim() !== '') {
      this.getDefaultAllergenicData(newOptionValue);
     
      
    }
  }

onSaveAllerginicData(product: string, data:AllergenicInstanceModel[]) {
  const allEntity = new AllergenicEntity();
  const allergenicProductEntity = new AllergenicProductEntity();
  allergenicProductEntity.urid = this.userService.getUserId();
  data.forEach(i => {
    let mapContains : { [key: string]: boolean} = {};
    let mapIngredients : { [key: string]: boolean} = {};
    if(i.checkedContains) {
      mapContains[i.name] = true;
    } else {
      mapContains[i.name] = false;;
    }
    allergenicProductEntity.contains.push(mapContains)
    if(i.checkedIngredients) {
      mapIngredients[i.name] = true;
    } else {
      mapIngredients[i.name] = false;
    }
    allergenicProductEntity.ingredients.push(mapIngredients)
  })
  var obj = JSON.parse(JSON.stringify(allergenicProductEntity));
  allEntity[product] = obj;
  this.allergenicService.onSaveAllerginicData(allEntity, product)
   
}

deleteProduct(deleteProduct: AllergenicProductModel) {
  this.allergenicService.deleteProduct(deleteProduct);
  this.allergenicProducts = this.allergenicProducts.filter(product => product.productName !== deleteProduct.productName);  
}

checkedContain(allergenicModel: AllergenicInstanceModel) {
  if (!allergenicModel.checkedContains && this.isAllContainsSelected()) {
    this.selectAll = false;
  } else {
    allergenicModel.checkedContains = !allergenicModel.checkedContains;
  }
}

changeIngredient(allergenicModel: AllergenicInstanceModel) {
  if (!allergenicModel.checkedIngredients && this.isAllIngredientsSelected()) {
    this.selectAll = false;
  } else {
    allergenicModel.checkedIngredients = !allergenicModel.checkedIngredients;
  }
}

selectAllContains(event: any) {
  for (const prod of this.allergenicProducts) {
    for(const item of prod.allergenicData) {
      item.checkedContains = event.checked;
      item.checkedIngredients = false;
    }
  }
}

selectAllIngredients(event: any) {
  for (const prod of this.allergenicProducts) {
    for(const item of prod.allergenicData) {
      item.checkedIngredients = event.checked;
      item.checkedContains = false;
    }
  }
}

onCheckboxChange(selectedItem: any, type: string): void {
  if(type === 'contains') {
    selectedItem.checkedContains = true;
    selectedItem.checkedIngredients = false;
  } else if(type === 'ingredients') {
    selectedItem.checkedContains = false;
    selectedItem.checkedIngredients = true;
  }
}

export() {
  this.exportService.exportAllergenic();
}

isAllContainsSelected(): boolean {
  return this.allergenicData.every(item => item.checkedContains);
}

isAllIngredientsSelected(): boolean {
  return this.allergenicData.every(item => item.checkedIngredients);
}

isItemContainSelected(item: AllergenicInstanceModel): boolean {
  return item.checkedContains;
}

isItemIngredientSelected(item: AllergenicInstanceModel): boolean {
  return item.checkedIngredients;
}

setAll(checked: boolean) {
  this.allChecked = checked;
  if (this.allergenicData == null) {
    return;
  }
  this.allergenicData.forEach(t => (t.checkedContains = checked));
}

}
