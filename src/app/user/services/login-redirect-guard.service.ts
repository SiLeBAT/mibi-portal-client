import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectIsAlternativeWelcomePage } from 'app/core/state/core.selectors';
import { LogService } from '../../core/services/log.service';

@Injectable({
    providedIn: 'root'
})
export class LoginRedirectGuard implements CanActivate {

    constructor(
        private store$: Store,
        private router: Router,
        private logger: LogService
    ) { }

    canActivate(_activated: ActivatedRouteSnapshot, _snap: RouterStateSnapshot) {

        return this.store$.select(selectIsAlternativeWelcomePage).pipe(
            take(1),
            map(isAlternativeWelcomePage => {
                if (isAlternativeWelcomePage) {
                    this.router.navigate(['/'])
                        .catch(error => {
                            this.logger.error('Error during navigation.', error.stack);
                        });

                    return false;
                }
                return true;
            })
        );
    }
}
