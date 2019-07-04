import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Samples } from '../samples.store';
import { selectHasEntries } from '../state/samples.selectors';

@Injectable({
    providedIn: 'root'
})
export class NoSampleGuard implements CanActivate {

    constructor(
        private store: Store<Samples>,
        private router: Router) { }

    async canActivate() {
        return this.store.pipe(select(selectHasEntries),
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
