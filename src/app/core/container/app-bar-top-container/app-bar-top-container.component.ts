import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromUser from '../../../user/state/user.reducer';
import { Observable } from 'rxjs';
import { User } from '../../../user/model/user.model';
import { environment } from '../../../../environments/environment';

// TODO: Should have pass navBarConfig to presentational component, to make the presentational component more generic
@Component({
    selector: 'mibi-app-bar-top-container',
    template: `<mibi-app-bar-top
    [currentUser$]="currentUser$"
    [appName]="appName">
    </mibi-app-bar-top>`
})
export class AppBarTopContainerComponent implements OnInit {

    currentUser$: Observable<User | null>;
    appName = environment.appName;
    constructor(
        private store: Store<fromUser.IState>) { }

    ngOnInit() {
        this.currentUser$ = this.store.pipe(
            select(fromUser.getCurrentUser)
        );

    }

}
