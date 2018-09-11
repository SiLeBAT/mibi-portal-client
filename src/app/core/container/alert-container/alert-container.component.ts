import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromCore from '../../state/core.reducer';
import { Observable } from 'rxjs';
import { IAlert } from '../../model/alert.model';

@Component({
    selector: 'mibi-alert-container',
    template: `<mibi-alert [alert]="alert$ | async"></mibi-alert>`
})
export class AlertContainerComponent implements OnInit {

    alert$: Observable<IAlert | null>;
    constructor(private store: Store<fromCore.IState>) { }

    ngOnInit() {
        this.alert$ = this.store.pipe(select(fromCore.getAlert));
    }

}
