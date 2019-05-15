import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { environment } from '../../../../environments/environment';
import { Core } from '../../core.state';
import { DestroyBanner } from '../../state/core.actions';
import { isBusy, showBanner } from '../../state/core.reducer';

@Component({
    selector: 'mibi-page-body-container',
    template: `<mibi-page-body [isBusy$]="isBusy$" [isBanner$]="isBanner$" (onAnimationDone)="onAnimationDone()"></mibi-page-body>`
})
export class PageBodyContainerComponent implements OnInit {

    supportContact: string;
    isBusy$: Observable<boolean>;
    isBanner$: Observable<boolean>;
    constructor(
        private store$: Store<Core>) { }

    ngOnInit() {
        this.isBusy$ = this.store$.pipe(select(isBusy));
        this.isBanner$ = this.store$.pipe(select(showBanner));
        this.supportContact = environment.supportContact;
    }

    onAnimationDone() {
        this.store$.dispatch(new DestroyBanner());
    }
}
