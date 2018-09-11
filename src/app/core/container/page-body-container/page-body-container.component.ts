import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromCore from '../../state/core.reducer';
import { environment } from '../../../../environments/default.environment';

@Component({
    selector: 'mibi-page-body-container',
    template: `<mibi-page-body [isBusy$]="isBusy$"></mibi-page-body>`
})
export class PageBodyContainerComponent implements OnInit {

    supportContact: string;
    isBusy$: Observable<boolean>;
    constructor(
        private store: Store<fromCore.IState>) { }

    ngOnInit() {
        this.isBusy$ = this.store.pipe(select(fromCore.isBusy));
        this.supportContact = environment.supportContact;
    }

}
