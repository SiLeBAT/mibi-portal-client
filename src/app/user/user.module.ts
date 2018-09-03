import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth-guard.service';
import { LoginViewComponent } from './presentation/login-view/login-view.component';
import { LoginComponent } from './presentation/login/login.component';
import { LoginContainerComponent } from './container/login-container/login-container.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { UserViewLayoutComponent } from './presentation/user-view-layout/user-view-layout.component';
import { RegisterComponent } from './presentation/register/register.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { LoginViewContainerComponent } from './container/login-view-container/login-view-container.component';
import { RegisterContainerComponent } from './container/register-container/register-container.component';
import { RegisterViewComponent } from './presentation/register-view/register-view.component';
import { ProfileContainerComponent } from './container/profile-container/profile-container.component';
import { ProfileComponent } from './presentation/profile/profile.component';
import { ResetContainerComponent } from './container/reset-container/reset-container.component';
import { ResetViewComponent } from './presentation/reset-view/reset-view.component';
import { ResetComponent } from './presentation/reset/reset.component';
import { RecoveryContainerComponent } from './container/recovery-container/recovery-container.component';
import { RecoveryComponent } from './presentation/recovery/recovery.component';
import { RecoveryViewComponent } from './presentation/recovery-view/recovery-view.component';
import { ActivateContainerComponent } from './container/activate-container/activate-container.component';
import { ActivateViewComponent } from './presentation/acitvate-view/activate-view.component';
import { ActivateComponent } from './presentation/activate/activate.component';
import { AdminActivateContainerComponent } from './container/admin-activate-container/admin-activate-container.component';
import { AdminActivateViewComponent } from './presentation/admin-activate-view/admin-activate-view.component';
import { AdminActivateComponent } from './presentation/admin-activate/admin-activate.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PasswordStrengthMeterModule,
        SharedModule,
        RouterModule.forChild([{
            path: 'users',
            children: [
                { path: 'login', component: LoginViewContainerComponent },
                { path: 'register', component: RegisterViewComponent },
                { path: 'recovery', component: RecoveryViewComponent },
                { path: 'reset/:id', component: ResetViewComponent },
                { path: 'activate/:id', component: ActivateViewComponent },
                { path: 'adminactivate/:id', component: AdminActivateViewComponent },
                { path: 'profile', component: ProfileContainerComponent, canActivate: [AuthGuard] }
            ]
        }])
    ],
    declarations: [
        AdminActivateComponent,
        AdminActivateContainerComponent,
        AdminActivateViewComponent,
        ActivateComponent,
        ActivateContainerComponent,
        ActivateViewComponent,
        RecoveryViewComponent,
        RecoveryComponent,
        RecoveryContainerComponent,
        ResetComponent,
        ResetContainerComponent,
        ResetViewComponent,
        ProfileContainerComponent,
        ProfileComponent,
        RegisterViewComponent,
        RegisterContainerComponent,
        RegisterComponent,
        UserViewLayoutComponent,
        LoginComponent,
        LoginContainerComponent,
        LoginViewContainerComponent,
        LoginViewComponent
    ],
    exports: []
})
export class UserModule { }
