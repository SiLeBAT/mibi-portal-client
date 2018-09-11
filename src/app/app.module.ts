import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JasperoConfirmationsModule } from '@jaspero/ng-confirmations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { TokenInterceptor } from './core/services/token-interceptor.service';
import { JwtInterceptor } from './core/services/jwt-interceptor.service';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SamplesModule } from './samples/samples.module';
import { UserModule } from './user/user.module';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        JasperoConfirmationsModule.forRoot(),
        StoreModule.forRoot({
            router: routerReducer
        }),
        StoreDevtoolsModule.instrument({
            name: 'MiBi Portal Devtools',
            maxAge: 25,
            logOnly: environment.production
        }),
        EffectsModule.forRoot([]),
        CoreModule,
        SharedModule,
        SamplesModule,
        UserModule,
        // AppRoutingModule needs to be at the end
        AppRoutingModule,
        StoreRouterConnectingModule.forRoot()
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
