import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { UserLinkProviderService } from '../link-provider.service';

@Injectable({
    providedIn: 'root'
})
export class TokenValidationResolver implements Resolve<boolean> {

    constructor(
        private dataService: DataService,
        private userLinks: UserLinkProviderService
    ) { }

    async resolve(activatedRoute: ActivatedRouteSnapshot, _snap: RouterStateSnapshot): Promise<boolean> {
        const token = activatedRoute.params[this.userLinks.activateIdParam];
        return this.dataService.verifyEmail(token).toPromise().then(
            (t: boolean) => t,
            () => false)
            .catch(
                () => false);
    }
}
