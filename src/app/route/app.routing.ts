import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './../auth/home/home.component';
import { LoginComponent } from './../auth/login/login.component';
import { RegisterComponent } from './../auth/register/register.component';
import { RecoveryComponent } from './../auth/recovery/recovery.component';
import { ResetComponent } from './../auth/reset/reset.component';
import { AuthGuard } from './../auth/guards/auth.guard';
import { UploadComponent } from '../upload/upload.component';
import { MainDashComponent } from '../main-dash/main-dash.component';

const appRoutes: Routes = [
  { path: '', component: MainDashComponent},
  { path: 'main', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'users/login', component: LoginComponent },
  { path: 'users/register', component: RegisterComponent },
  { path: 'users/recovery', component: RecoveryComponent },
  { path: 'users/reset/:id', component: ResetComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);



