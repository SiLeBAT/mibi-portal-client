import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { routerReducer } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { AppComponent } from './app/app.component';
import { CoreModule } from './app/core/core.module';
import { KEYCLOAK_ENABLED } from './app/user/services/auth.tokens';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                StoreModule.forRoot({
                    router: routerReducer
                }, {
                    runtimeChecks: {
                        strictStateSerializability: false,
                        strictActionSerializability: false,
                        strictActionWithinNgZone: true,
                        strictActionTypeUniqueness: true
                    }
                }),
                EffectsModule.forRoot([]),
                CoreModule
            ],
            declarations: [AppComponent],
            // KEYCLOAK_ENABLED is normally provided at the platform injector in
            // main.ts; the testing injector must provide it explicitly.
            providers: [{ provide: KEYCLOAK_ENABLED, useValue: false }]
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });
});
