import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromCore from '../../state/core.reducer';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

@Component({
    selector: 'mibi-page-body-container',
    template: `<mibi-page-body [isBusy$]="isBusy$" [isBanner$]="isBanner$"></mibi-page-body>`
})
export class PageBodyContainerComponent implements OnInit {

    supportContact: string;
    isBusy$: Observable<boolean>;
    isBanner$: Observable<boolean>;
    constructor(
        private store: Store<fromCore.State>) { }

    ngOnInit() {
        this.isBusy$ = this.store.pipe(select(fromCore.isBusy));
        this.isBanner$ = this.store.pipe(select(fromCore.getBanner),
            map(banner => !!banner));
        this.supportContact = environment.supportContact;
    }

}
