import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/compat/auth';
import {AngularFirestoreModule, USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/compat/firestore';
import {AngularFireFunctionsModule, USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/compat/functions';
import {environment} from '../environments/environment';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFireStorageModule} from '@angular/fire/compat/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatExpansionModule} from '@angular/material/expansion';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AppRoutingModule} from './app-routing.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MatNativeDateModule, MAT_DATE_LOCALE} from '@angular/material/core';
import { BusinessComponent } from './business/business.component';
import { BusinessFilesComponent } from './business/business-files/business-files.component';
import { BusinessFileDetailsComponent } from './business/business-file-details/business-file-details.component';
import { BusinessFileComponent } from './business/business-files/business-file/business-file.component';
import { BusinessService } from './services/business.service';
import { HeaderComponent } from './header/header.component';
import { AuthComponent } from './auth/auth.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import {TextFieldModule} from '@angular/cdk/text-field'; 
import { FileUploadService } from './services/file-upload.service';
import { UploadFormComponent } from './file-upload/upload-form/upload-form.component';
import { UploadListComponent } from './file-upload/upload-list/upload-list.component';
import { UploadDetailsComponent } from './file-upload/upload-details/upload-details.component';
import { StaffComponent } from './staff/staff.component';
import { StaffFilesComponent } from './staff/staff-files/staff-files.component';
import { StaffFileDetailsComponent } from './staff/staff-file-details/staff-file-details.component';
import { StaffService } from './services/staff.service';
import { WaterComponent } from './water/water.component';
import { WaterFilesComponent } from './water/water-files/water-files.component';
import { WaterFileDetailsComponent } from './water/water-file-details/water-file-details.component';
import { WaterService } from './services/water.service';
import { DisinsectComponent } from './disinsect/disinsect.component';
import { DisinsectFilesComponent } from './disinsect/disinsect-files/disinsect-files.component';
import { DisinsectFileDetailsComponent } from './disinsect/disinsect-file-details/disinsect-file-details.component';
import { DisinsectService } from './services/disinsect.service';
import { TemperatureComponent } from './temperature/temperature.component';
import { TemperatureService } from './services/temperature.service';
import { ExportService } from './services/export.service';
import { SupplierService } from './services/supplier.service';
import { AddTemperatureComponent } from './temperature/add-temperature/add-temperature.component';
import { EditTemperatureComponent } from './temperature/edit-temperature/edit-temperature.component';
import { CleaningDisinfectionComponent } from './cleaning-disinfection/cleaning-disinfection.component';
import { CleaningService } from './services/cleaning.service';
import { EditUserComponent } from './user/edit-user/edit-user.component';
import { UserComponent } from './user/user.component';
import { TemperatureProfileComponent } from './temperature/temperature-profile/temperature-profile.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { SupplierFilesComponent } from './suppliers/supplier-files/supplier-files.component';
import { SuppliersListComponent } from './suppliers/suppliers-list/suppliers-list.component';
import { AddSupplierComponent } from './suppliers/add-supplier/add-supplier.component';
import { SupplierFileDetailsComponent } from './suppliers/supplier-file-details/supplier-file-details.component';
import { AddRowTemperatureComponent } from './temperature/add-temperature/add-row-temperature/add-row-temperature.component';
import { CleaningFilesComponent } from './cleaning-disinfection/cleaning-files/cleaning-files.component';
import { CleaningFileDetailsComponent } from './cleaning-disinfection/cleaning-file-details/cleaning-file-details.component';
import { AllergenicComponent } from './allergenic/allergenic.component';
import { SupplierEvaluationComponent } from './suppliers/supplier-evaluation/supplier-evaluation.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CompleteProfileDialogComponent } from './auth/complete-profile-dialog/complete-profile-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    BusinessComponent,
    BusinessFilesComponent,
    BusinessFileDetailsComponent,
    BusinessFileComponent,
    HeaderComponent,
    UploadFormComponent,
    UploadListComponent,
    UploadDetailsComponent,
    AuthComponent,
    StaffComponent,
    StaffFilesComponent,
    StaffFileDetailsComponent,
    WaterComponent,
    WaterFilesComponent,
    WaterFileDetailsComponent,
    DisinsectComponent,
    DisinsectFilesComponent,
    DisinsectFileDetailsComponent,
    TemperatureComponent,
    AddTemperatureComponent,
    EditTemperatureComponent,
    CleaningDisinfectionComponent,
    EditUserComponent,
    UserComponent,
    TemperatureProfileComponent,
    SuppliersComponent,
    SupplierFilesComponent,
    SuppliersListComponent,
    AddSupplierComponent,
    SupplierFileDetailsComponent,
    AddRowTemperatureComponent,
    CleaningFilesComponent,
    CleaningFileDetailsComponent,
    AllergenicComponent,
    SupplierEvaluationComponent,
    AdminDashboardComponent,
    CompleteProfileDialogComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,

    BrowserModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatNativeDateModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    AngularFireFunctionsModule,    
  ],
  providers: [DisinsectService, WaterService, StaffService, BusinessService, TemperatureService, FileUploadService, CleaningService, SupplierService, ExportService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
