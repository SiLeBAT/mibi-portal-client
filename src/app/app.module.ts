import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { TokenInterceptor } from './core/services/token-interceptor.service';
import { HttpErrorMapperService } from './core/services/http-error-mapper.service';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SamplesModule } from './samples/samples.module';
import { UserModule } from './user/user.module';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { ContentModule } from './content/content.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainModule } from './main/main.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        StoreModule.forRoot({
            router: routerReducer
        }, {
            runtimeChecks: {
                // needs refactoring of banner feature (custom banner uses functions as state)
                strictStateSerializability: false,
                // needs refactoring of upload feature (import action uses file as payload)
                strictActionSerializability: false,
                strictActionWithinNgZone: true,
                strictActionTypeUniqueness: true
            }
        }),
        StoreDevtoolsModule.instrument({
            name: 'MiBi Portal Devtools',
            maxAge: 25,
            logOnly: environment.production
        }),
        EffectsModule.forRoot([]),
        CoreModule,
        SharedModule,
        MainModule,
        SamplesModule,
        UserModule,
        ContentModule,
        StoreRouterConnectingModule.forRoot(),
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
            useClass: HttpErrorMapperService,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
