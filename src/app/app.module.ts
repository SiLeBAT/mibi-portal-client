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
import { AlertService } from './services/alert.service';
import { UserService } from './auth/services/user.service';
import { ExcelToJsonService } from './services/excel-to-json.service';
import { LoadingSpinnerService } from './services/loading-spinner.service';
import { WindowRefService } from './sampleManagement/services/window-ref.service';
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
import { DataGridContainerComponent } from './sampleManagement/container/data-grid-container/data-grid-container.component';
import { SpinnerContainerComponent } from './shared/spinner-container/spinner-container.component';
import { GenericSpinnerComponent } from './shared/generic-spinner/generic-spinner.component';
import { DropdownDirective } from './shared/directive/dropdown.directive';
import { AdminActivateComponent } from './auth/admin-activate/admin-activate.component';
import { CanDeactivateGuard } from './can-deactivate/can-deactivate.guard';
import { DataGridComponent } from './sampleManagement/presentation/data-grid/data-grid.component';
import { SampleStore } from './sampleManagement/services/sampleStore.service';
import { NavBarComponent } from './core/presentation/nav-bar/nav-bar.component';
import { ExcelConverterService } from './sampleManagement/services/excel-converter.service';
import { ExportService } from './sampleManagement/services/export.service';
import { SendSampleService } from './sampleManagement/services/send-sample.service';
import { ValidationService } from './sampleManagement/services/validation.service';
import { SampleViewComponent } from './sampleManagement/presentation/sample-view/sample-view.component';
import { SampleViewContainerComponent } from './sampleManagement/container/sample-view-container/sample-view-container.component';
import { SampleSheetUtilService } from './sampleManagement/services/sampleSheetUtil.service';
import { HttpFacadeService } from './services/httpFacade.service';
import { NavBarContainerComponent } from './core/container/nav-bar-container/nav-bar-container.component';
import { LogService } from './shared/services/log.service';
import { LogPublishersService } from './shared/services/log-publishers.service';
import { NoSampleGuard } from './sampleManagement/services/no-sample.guard';
import { AppRoutingModule } from './app-routing.module';

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
        DataGridContainerComponent,
        SpinnerContainerComponent,
        GenericSpinnerComponent,
        DropdownDirective,
        AdminActivateComponent,
        DataGridComponent,
        NavBarComponent,
        SampleViewComponent,
        SampleViewContainerComponent,
        NavBarContainerComponent
    ],
    imports: [
        BrowserModule,
        HotTableModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ngfModule,
        JasperoConfirmationsModule.forRoot(),
        PasswordStrengthMeterModule,
        AppRoutingModule
    ],
    providers: [
        AuthService,
        AlertService,
        UserService,
        ExcelToJsonService,
        LoadingSpinnerService,
        WindowRefService,
        AuthGuard,
        NoSampleGuard,
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
        },
        SampleStore,
        ExcelConverterService,
        ExportService,
        SendSampleService,
        ValidationService,
        SampleSheetUtilService,
        HttpFacadeService,
        LogService,
        LogPublishersService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
