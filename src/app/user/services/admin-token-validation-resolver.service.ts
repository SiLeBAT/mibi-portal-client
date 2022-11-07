import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserActivation } from '../model/user.model';
import { UserLinkProviderService } from '../link-provider.service';

@Injectable({
    providedIn: 'root'
})
export class AdminTokenValidationResolver implements Resolve<UserActivation> {

    constructor(
        private dataService: DataService,
        private userLinks: UserLinkProviderService
    ) { }

    resolve(activatedRoute: ActivatedRouteSnapshot, _snap: RouterStateSnapshot): Observable<UserActivation> {
        const token = activatedRoute.params[this.userLinks.adminActivateIdParam];
        return this.dataService.activateAccount(token).pipe(
            catchError(() => of({
                activation: false,
                username: ''
            }))
        );
    }
}
