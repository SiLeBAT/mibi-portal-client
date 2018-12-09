import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import * as fromSamples from '../state/samples.reducer';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NoSampleGuard implements CanActivate {

    constructor(
        private store: Store<fromSamples.State>,
        private router: Router) { }

    async canActivate() {
        return this.store.pipe(select(fromSamples.hasEntries),
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
        this.router.navigate(['/upload']).catch(() => {
            throw new Error('Unable to navigate.');
        });
        return false;
    }
}
