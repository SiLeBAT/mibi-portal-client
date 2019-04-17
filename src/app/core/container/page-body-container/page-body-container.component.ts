import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromCore from '../../state/core.reducer';
import * as coreActions from '../../state/core.actions';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'mibi-page-body-container',
    template: `<mibi-page-body [isBusy$]="isBusy$" [isBanner$]="isBanner$" (onAnimationDone)="onAnimationDone()"></mibi-page-body>`
})
export class PageBodyContainerComponent implements OnInit {

    supportContact: string;
    isBusy$: Observable<boolean>;
    isBanner$: Observable<boolean>;
    constructor(
        private store$: Store<fromCore.State>) { }

    ngOnInit() {
        this.isBusy$ = this.store$.pipe(select(fromCore.isBusy));
        this.isBanner$ = this.store$.pipe(select(fromCore.showBanner));
        this.supportContact = environment.supportContact;
    }

    onAnimationDone() {
        this.store$.dispatch(new coreActions.DestroyBanner());
    }
}
