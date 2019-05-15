import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import * as fromUser from '../../state/user.reducer';
import * as coreActions from '../../../core/state/core.actions';

@Component({
    selector: 'mibi-activate-container',
    template: `<mibi-activate [appName]="appName" [tokenValid]="tokenValid"></mibi-activate>`
})
export class ActivateContainerComponent implements OnInit {
    tokenValid: boolean = false;
    appName: string = environment.appName;

    constructor(private activatedRoute: ActivatedRoute,
        private router: Router,
        private store: Store<fromUser.UserMainState>) { }

    ngOnInit() {
        this.tokenValid = this.activatedRoute.snapshot.data['tokenValid'];

        if (this.tokenValid) {
            this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'accountActivationSuccess' }));
        } else {
            this.store.dispatch(new coreActions.DisplayBanner({ predefined: 'accountActivationFailure' }));
        }
    }

    continue() {
        this.router.navigate(['users/login']).catch(() => {
            throw new Error('Unable to navigate.');
        });
    }

}
