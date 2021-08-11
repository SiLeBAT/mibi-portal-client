import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { NavigateMSA } from '../../shared/navigate/navigate.actions';
import { SamplesMainSlice } from '../samples.state';
import { selectHasEntries } from '../state/samples.selectors';

@Injectable({
    providedIn: 'root'
})
export class NoSampleGuard implements CanActivate {

    constructor(private store$: Store<SamplesMainSlice>) { }

    async canActivate() {
        return this.store$.pipe(select(selectHasEntries),
            take(1))
            .toPromise()
            .then(
                hasEntries => {
                    if (hasEntries) {
                        return true;
                    } else {
                        return this.onDissallow();
                    }
                },
                () => this.onDissallow()
            )
            .catch(() => this.onDissallow());
    }

    private onDissallow() {
        this.store$.dispatch(new NavigateMSA({ url: '/upload' }));
        return false;
    }
}
