import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { userRecoverPasswordSSA } from '../../recover-password/recover-password.actions';

@Component({
    standalone: false,
    selector: 'mibi-recovery-container',
    template: `<mibi-recovery (recovery)="recovery($event)"></mibi-recovery>`
})
export class RecoveryContainerComponent {

    constructor(private store$: Store) { }

    recovery(email: string) {
        this.store$.dispatch(userRecoverPasswordSSA({ email: email }));
    }
}
