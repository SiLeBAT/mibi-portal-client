import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainDashComponent } from './main-dash/main-dash.component';
import { HomeComponent } from './auth/home/home.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { UploadComponent } from './upload/upload.component';
import { SampleViewContainerComponent } from './sampleManagement/container/sample-view-container/sample-view-container.component';
import { NoSampleGuard } from './sampleManagement/services/no-sample.guard';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { UserdataComponent } from './myaccount/userdata/userdata.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { ResetComponent } from './auth/reset/reset.component';
import { ActivateComponent } from './auth/activate/activate.component';
import { AdminActivateComponent } from './auth/admin-activate/admin-activate.component';

const ROUTES: Routes = [
    { path: '', component: MainDashComponent },
    { path: 'main', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'upload', component: UploadComponent },
    { path: 'samples', component: SampleViewContainerComponent, canActivate: [NoSampleGuard] },
    { path: 'myaccount', component: MyaccountComponent, canActivate: [AuthGuard] },
    { path: 'userdata', component: UserdataComponent, canActivate: [AuthGuard] },
    { path: 'userdata/:index', component: UserdataComponent, canActivate: [AuthGuard] },
    { path: 'users/login', component: LoginComponent },
    { path: 'users/register', component: RegisterComponent },
    { path: 'users/recovery', component: RecoveryComponent },
    { path: 'users/reset/:id', component: ResetComponent },
    { path: 'users/activate/:id', component: ActivateComponent },
    { path: 'users/adminactivate/:id', component: AdminActivateComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(ROUTES)
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
