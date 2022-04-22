import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { CoreMainSlice } from '../../core.state';
import { destroyBannerSOA } from '../../state/core.actions';
import { selectIsBusy, selectIsBannerShown } from '../../state/core.selectors';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'mibi-page-body-container',
    template: `<mibi-page-body [isBusy]="isBusy$ | async" [isBanner]="isBanner$ | async" (animationDone)="onAnimationDone()"></mibi-page-body>`
})
export class PageBodyContainerComponent implements OnInit {

    supportContact: string;
    isBusy$: Observable<boolean>;
    isBanner$: Observable<boolean>;
    isBanner: boolean;
    constructor(
        private store$: Store<CoreMainSlice>) { }

    ngOnInit() {
        this.isBusy$ = this.store$.pipe(select(selectIsBusy));
        this.isBanner$ = this.store$.pipe(select(selectIsBannerShown), tap(isBanner => { this.isBanner = isBanner; }));
        this.supportContact = environment.supportContact;
    }

    onAnimationDone() {
        if (!this.isBanner) {
            this.store$.dispatch(destroyBannerSOA());
        }
    }
}
