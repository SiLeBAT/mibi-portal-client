import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ngfModule } from 'angular-file';
import { HotTableModule } from '@handsontable/angular';
import { JasperoConfirmationsModule } from '@jaspero/ng-confirmations';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';

import { AppComponent } from './app.component';
import { AlertComponent } from './auth/alert/alert.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthService } from './auth/services/auth.service';
import { AlertService } from './auth/services/alert.service';
import { UserService } from './auth/services/user.service';
import { UploadService } from './services/upload.service';
import { ValidateService } from './services/validate.service';
import { ExcelToJsonService } from './services/excel-to-json.service';
import { JsonToExcelService } from './services/json-to-excel.service';
import { TableToJsonService } from './services/table-to-json.service';
import { LoadingSpinnerService } from './services/loading-spinner.service';
import { WindowRefService } from './services/window-ref.service';
import { routing } from './route/app.routing';
import { HomeComponent } from './auth/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { ResetComponent } from './auth/reset/reset.component';
import { TokenInterceptor } from './auth/interceptors/token.interceptor';
import { JwtInterceptor } from './auth/interceptors/jwt.interceptor';
import { UploadComponent } from './upload/upload.component';
import { MainDashComponent } from './main-dash/main-dash.component';
import { MyaccountComponent } from './myaccount/myaccount.component';
import { UserdataComponent } from './myaccount/userdata/userdata.component';
import { ActivateComponent } from './auth/activate/activate.component';
import { ValidatorComponent } from './validator/validator.component';
import { SpinnerContainerComponent } from './shared/spinner-container/spinner-container.component';
import { GenericSpinnerComponent } from './shared/generic-spinner/generic-spinner.component';
import { DropdownDirective } from './shared/directive/dropdown.directive';
import { AdminActivateComponent } from './auth/admin-activate/admin-activate.component';
import { CanDeactivateGuard } from './can-deactivate/can-deactivate.guard';

@NgModule({
    declarations: [
        AppComponent,
        RegisterComponent,
        AlertComponent,
        HomeComponent,
        LoginComponent,
        RecoveryComponent,
        ResetComponent,
        UploadComponent,
        MainDashComponent,
        MyaccountComponent,
        UserdataComponent,
        ActivateComponent,
        ValidatorComponent,
        SpinnerContainerComponent,
        GenericSpinnerComponent,
        DropdownDirective,
        AdminActivateComponent
    ],
    imports: [
        BrowserModule,
        HotTableModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ngfModule,
        routing,
        JasperoConfirmationsModule.forRoot(),
        PasswordStrengthMeterModule
    ],
    providers: [
        AuthService,
        AlertService,
        UserService,
        UploadService,
        ValidateService,
        ExcelToJsonService,
        JsonToExcelService,
        TableToJsonService,
        LoadingSpinnerService,
        WindowRefService,
        AuthGuard,
        CanDeactivateGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: JwtInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
