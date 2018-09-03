import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './user/services/auth-guard.service';
import { MyaccountComponent } from './core/myaccount/myaccount.component';
import { UserdataComponent } from './core/myaccount/userdata/userdata.component';
import { HomeComponent } from './core/presentation/home/home.component';

const ROUTES: Routes = [
    { path: '', component: HomeComponent },
    { path: 'myaccount', component: MyaccountComponent, canActivate: [AuthGuard] },
    { path: 'userdata', component: UserdataComponent, canActivate: [AuthGuard] },
    { path: 'userdata/:index', component: UserdataComponent, canActivate: [AuthGuard] },
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
