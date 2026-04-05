import { NgModule } from "@angular/core";
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo } from "@angular/fire/compat/auth-guard";
import { RouterModule, Routes } from "@angular/router";
import { AllergenicComponent } from "./allergenic/allergenic.component";
import { AuthComponent } from "./auth/auth.component";
import { BusinessComponent } from "./business/business.component";
import { CleaningDisinfectionComponent } from "./cleaning-disinfection/cleaning-disinfection.component";
import { DisinsectComponent } from "./disinsect/disinsect.component";
import { HomeComponent } from "./home/home.component";
import { StaffComponent } from "./staff/staff.component";
import { SupplierFilesComponent } from "./suppliers/supplier-files/supplier-files.component";
import { AddTemperatureComponent } from "./temperature/add-temperature/add-temperature.component";
import { TemperatureProfileComponent } from "./temperature/temperature-profile/temperature-profile.component";
import { TemperatureComponent } from "./temperature/temperature.component";
import { WaterComponent } from "./water/water.component";
import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";

const redirectUnathorizedToLogin = () => redirectUnauthorizedTo(['auth']);

const routes: Routes=[
    { path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: 'home',  component: HomeComponent
       
    },
    { path: 'admin-dashboard',  component: AdminDashboardComponent, canActivate: [AngularFireAuthGuard],
        data: {
            authGuardPipe: redirectUnathorizedToLogin
        }
    },
    { path: 'business-files',  component: BusinessComponent, canActivate: [AngularFireAuthGuard],
        data: {
            authGuardPipe: redirectUnathorizedToLogin
        }
    },
    { path: 'staff-files',  component: StaffComponent, canActivate: [AngularFireAuthGuard],
        data: {
            authGuardPipe: redirectUnathorizedToLogin
        }
    },
    { path: 'allergenic',  component: AllergenicComponent, canActivate: [AngularFireAuthGuard],
        data: {
            authGuardPipe: redirectUnathorizedToLogin
        }
    },
    { path: 'water-files',  component: WaterComponent, canActivate: [AngularFireAuthGuard]},
    { path: 'disinsect-files',  component: DisinsectComponent, canActivate: [AngularFireAuthGuard]},
    { path: 'add-temperature',  component: AddTemperatureComponent, canActivate: [AngularFireAuthGuard]},
    { path: 'temperatures',  component: TemperatureComponent, canActivate: [AngularFireAuthGuard]},
    { path: 'cleaning-disinfection',  component: CleaningDisinfectionComponent, canActivate: [AngularFireAuthGuard]},
    { path: 'temperatures-profile',  component: TemperatureProfileComponent, canActivate: [AngularFireAuthGuard]},  
    { path: 'supplier-files',  component: SupplierFilesComponent, canActivate: [AngularFireAuthGuard]},  
    { path: 'auth',  component: AuthComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}


