import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { selectIsAlternativeWelcomePage } from '../state/core.selectors';
import { first } from 'rxjs/operators';
import { CoreMainSlice } from '../core.state';

@Injectable({
    providedIn: 'root'
})
export class HomeResolver  {

    constructor(
        private store$: Store<CoreMainSlice>
    ) { }

    resolve() {
        return this.store$.select(selectIsAlternativeWelcomePage).pipe(first());
    }
}
