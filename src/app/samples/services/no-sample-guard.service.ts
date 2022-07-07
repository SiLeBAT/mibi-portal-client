import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { SamplesLinkProviderService } from '../link-provider.service';
import { SamplesMainSlice } from '../samples.state';
import { selectHasEntries } from '../state/samples.selectors';

@Injectable({
    providedIn: 'root'
})
export class NoSampleGuard implements CanActivate {

    constructor(
        private store$: Store<SamplesMainSlice>,
        private samplesLinks: SamplesLinkProviderService
    ) { }

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
        this.store$.dispatch(navigateMSA({ path: this.samplesLinks.upload }));
        return false;
    }
}
