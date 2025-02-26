import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginViewComponent } from './presentation/login-view/login-view.component';
import { LoginComponent } from './presentation/login/login.component';
import { LoginContainerComponent } from './container/login-container/login-container.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RegisterComponent } from './presentation/register/register.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
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
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { DatenschutzHinweiseComponent } from './presentation/datenschutzhinweise/datenschutzhinweise.component';
import { DatenSchutzHinweiseViewComponent } from './presentation/datenschutzhinweise-view/datenschutzhinweise-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PasswordComponent } from './password/password.component';
import { USER_SLICE_NAME } from './user.state';
import { userReducerMap, userEffects } from './user.store';
import { userPathsParams, userPathsSegments } from './user.paths';
import { AnonymousGuard } from './services/anonymous-guard.service';
import { TokenValidationResolver } from './services/token-validation-resolver.service';
import { AdminTokenValidationResolver } from './services/admin-token-validation-resolver.service';
import { AuthGuard } from './services/auth-guard.service';
import { LoginRedirectGuard } from './services/login-redirect-guard.service';

const parametrizedPaths = {
    reset: userPathsSegments.reset + '/:' + userPathsParams.reset.id,
    activate: userPathsSegments.activate + '/:' + userPathsParams.activate.id,
    adminActivate: userPathsSegments.adminActivate + '/:' + userPathsParams.adminActivate.id
};

const routes: Routes = [{
    path: userPathsSegments.users,
    children: [
        { path: userPathsSegments.login, component: LoginViewComponent, canActivate: [AnonymousGuard, LoginRedirectGuard] },
        { path: userPathsSegments.register, component: RegisterViewComponent, canActivate: [AnonymousGuard] },
        { path: userPathsSegments.recovery, component: RecoveryViewComponent, canActivate: [AnonymousGuard] },
        { path: parametrizedPaths.reset, component: ResetViewComponent, canActivate: [AnonymousGuard] },
        { path: parametrizedPaths.activate, component: ActivateViewComponent, resolve: { tokenValid: TokenValidationResolver } },
        {
            path: parametrizedPaths.adminActivate,
            component: AdminActivateViewComponent,
            resolve: { adminTokenValid: AdminTokenValidationResolver }
        },
        { path: userPathsSegments.profile, component: ProfileContainerComponent, canActivate: [AuthGuard] },
        { path: userPathsSegments.privacyPolicy, component: DatenSchutzHinweiseViewComponent },
        { path: '**', redirectTo: userPathsSegments.login }
    ]
}];

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        MatAutocompleteModule,
        PasswordStrengthMeterModule.forRoot(),
        SharedModule,
        RouterModule.forChild(routes),
        StoreModule.forFeature(USER_SLICE_NAME, userReducerMap),
        EffectsModule.forFeature(userEffects)
    ],
    declarations: [
        PasswordComponent,
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
        LoginComponent,
        LoginContainerComponent,
        LoginViewComponent,
        DatenschutzHinweiseComponent,
        DatenSchutzHinweiseViewComponent
    ],
    exports: []
})
export class UserModule { }
