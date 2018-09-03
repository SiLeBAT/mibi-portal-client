import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JasperoConfirmationsModule } from '@jaspero/ng-confirmations';

import { AppComponent } from './app.component';
import { TokenInterceptor } from './core/services/token-interceptor.service';
import { JwtInterceptor } from './core/services/jwt-interceptor.service';
import { MyaccountComponent } from './core/myaccount/myaccount.component';
import { UserdataComponent } from './core/myaccount/userdata/userdata.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SamplesModule } from './samples/samples.module';
import { UserModule } from './user/user.module';

@NgModule({
    declarations: [
        AppComponent,
        MyaccountComponent,
        UserdataComponent
    ],
    imports: [
        BrowserModule,
        JasperoConfirmationsModule.forRoot(),
        CoreModule,
        SharedModule,
        SamplesModule,
        UserModule,
        // AppRoutingModule needs to be at the end
        AppRoutingModule
    ],
    providers: [
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
