import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { CoreMainSlice } from '../../core.state';
import { destroyBannerSOA } from '../../state/core.actions';
import { selectIsBusy, selectIsBannerShown, selectIsAlternativeWelcomePage } from '../../state/core.selectors';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'mibi-page-body-container',
    template: `<mibi-page-body [isBusy]="isBusy$ | async" [isBanner]="isBanner$ | async" [isAlternativeWelcomePageActive]="isAlternativeWelcomePageActive$ | async" (animationDone)="onAnimationDone()"></mibi-page-body>`
})
export class PageBodyContainerComponent implements OnInit {

    isBusy$: Observable<boolean>;
    isBanner$: Observable<boolean>;
    isBanner: boolean;
    isAlternativeWelcomePageActive$: Observable<boolean>;
    isAlternativeWelcomePageActive: boolean;
    constructor(
        private store$: Store<CoreMainSlice>) { }

    ngOnInit() {
        this.isBusy$ = this.store$.pipe(select(selectIsBusy));
        this.isBanner$ = this.store$.pipe(select(selectIsBannerShown), tap(isBanner => { this.isBanner = isBanner; }));
        this.isAlternativeWelcomePageActive$ = this.store$.pipe(
            select(selectIsAlternativeWelcomePage),
            tap(isAlternativeWelcomePageActive => {
                this.isAlternativeWelcomePageActive = isAlternativeWelcomePageActive;
            })
        );

    }

    onAnimationDone() {
        if (!this.isBanner) {
            this.store$.dispatch(destroyBannerSOA());
        }
    }
}
