import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { selectIsAlternativeWelcomePage } from '../../core/state/core.selectors';
import { CoreMainSlice } from '../../core/core.state';

@Injectable({
    providedIn: 'root'
})
export class LoginRedirectGuard  {

    constructor(
        private store$: Store<CoreMainSlice>,
        private router: Router
    ) { }

    canActivate(): Observable<true | UrlTree> {
        return this.store$.select(selectIsAlternativeWelcomePage).pipe(
            take(1),
            map(isAlternativeWelcomePage => isAlternativeWelcomePage ? this.router.parseUrl('/') : true)
        );
    }
}
