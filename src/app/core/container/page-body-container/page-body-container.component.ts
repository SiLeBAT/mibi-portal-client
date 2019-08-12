import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { CoreMainSlice } from '../../core.state';
import { DestroyBanner } from '../../state/core.actions';
import { selectIsBusy, selectIsBannerShown } from '../../state/core.selectors';

@Component({
    selector: 'mibi-page-body-container',
    template: `<mibi-page-body [isBusy$]="isBusy$" [isBanner$]="isBanner$" (onAnimationDone)="onAnimationDone()"></mibi-page-body>`
})
export class PageBodyContainerComponent implements OnInit {

    supportContact: string;
    isBusy$: Observable<boolean>;
    isBanner$: Observable<boolean>;
    constructor(
        private store$: Store<CoreMainSlice>) { }

    ngOnInit() {
        this.isBusy$ = this.store$.pipe(select(selectIsBusy));
        this.isBanner$ = this.store$.pipe(select(selectIsBannerShown));
        this.supportContact = environment.supportContact;
    }

    onAnimationDone() {
        this.store$.dispatch(new DestroyBanner());
    }
}
