import { HTTP_INTERCEPTORS, HttpClientXsrfModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContentModule } from './content/content.module';
import { CoreModule } from './core/core.module';
import { HttpErrorMapperService } from './core/services/http-error-mapper.service';
import { TokenInterceptor } from './core/services/token-interceptor.service';
import { VersionCheckInterceptor } from './core/services/version-check-interceptor.service';
import { MainModule } from './main/main.module';
import { OrdersModule } from './orders/orders.module';
import { SamplesModule } from './samples/samples.module';
import { SharedModule } from './shared/shared.module';
import { AppAuthService } from './user/services/app-auth.service';
import { UserModule } from './user/user.module';
import { MarkdownModule, MARKED_OPTIONS } from 'ngx-markdown';

function markedOptionsFactory(): object {
    return {
        breaks: true,
        renderer: {
            link: (token: any): string => {
                // Bare GFM autolinks (e.g. https://example.com typed as plain text)
                // have a raw value that does not start with '[' — render as plain text.
                if (!token.raw.startsWith('[') && !token.raw.startsWith('<')) {
                    return token.text || token.href || '';
                }
                const title = token.title ? ` title="${token.title}"` : '';
                return `<a href="${token.href}"${title}>${token.text || token.href}</a>`;
            }
        }
    };
}

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
                strictActionWithinNgZone: false,
                strictActionTypeUniqueness: true
            }
        }),
        StoreDevtoolsModule.instrument({
            name: 'MiBi Portal Devtools',
            maxAge: 25,
            logOnly: environment.production,
            connectInZone: true
        }),
        EffectsModule.forRoot([]),
        CoreModule,
        SharedModule,
        MainModule,
        SamplesModule,
        UserModule,
        ContentModule,
        OrdersModule,
        HttpClientXsrfModule.withOptions({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
        StoreRouterConnectingModule.forRoot(),
        MarkdownModule.forRoot({
            markedOptions: {
                provide: MARKED_OPTIONS,
                useFactory: markedOptionsFactory
            }
        }),
        // AppRoutingModule needs to be at the end
        AppRoutingModule
    ],
    providers: [
        // Registered first so it wraps the rest of the chain: a client that the
        // server has already replaced must not reach the API at all.
        {
            provide: HTTP_INTERCEPTORS,
            useClass: VersionCheckInterceptor,
            multi: true
        },
        // TokenInterceptor only attaches a Bearer header when a legacy token is
        // present in storage, so it is a no-op in Keycloak (cookie-session) mode
        // and can be registered unconditionally.
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpErrorMapperService,
            multi: true
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (auth: AppAuthService) => async () => auth.bootstrap(),
            deps: [AppAuthService],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
