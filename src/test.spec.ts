import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EffectsModule } from '@ngrx/effects';
import { routerReducer } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { AppComponent } from './app/app.component';
import { CoreModule } from './app/core/core.module';

describe('AppComponent', () => {
    beforeEach(async(async () => {
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
            declarations: [AppComponent]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });
});
