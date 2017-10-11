import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './../auth/home/home.component';
// import { LoginComponent } from './login/index';
import { RegisterComponent } from './../auth/register/register.component';
import { AppComponent } from './../app.component';
// import { AuthGuard } from './_guards/index';

const appRoutes: Routes = [
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent},
  { path: '', component: AppComponent },
  // { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
