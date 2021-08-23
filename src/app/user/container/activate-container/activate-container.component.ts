import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { UserMainState } from '../../state/user.reducer';
import { showBannerSOA } from '../../../core/state/core.actions';

@Component({
    selector: 'mibi-activate-container',
    template: `<mibi-activate [appName]="appName" [tokenValid]="tokenValid"></mibi-activate>`
})
export class ActivateContainerComponent implements OnInit {
    tokenValid: boolean = false;
    appName: string = environment.appName;

    constructor(
        private activatedRoute: ActivatedRoute,
        private store$: Store<UserMainState>
    ) { }

    ngOnInit() {
        this.tokenValid = this.activatedRoute.snapshot.data['tokenValid'];

        if (this.tokenValid) {
            this.store$.dispatch(showBannerSOA({ predefined: 'accountActivationSuccess' }));
        } else {
            this.store$.dispatch(showBannerSOA({ predefined: 'accountActivationFailure' }));
        }
    }
}
