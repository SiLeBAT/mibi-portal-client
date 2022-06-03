import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { DataService } from '../../core/services/data.service';

@Injectable({
    providedIn: 'root'
})
export class TokenValidationResolver implements Resolve<boolean> {

    constructor(
        private dataService: DataService) { }

    async resolve(activatedRoute: ActivatedRouteSnapshot, _snap: RouterStateSnapshot): Promise<boolean> {
        const token = activatedRoute.params['id'];
        return this.dataService.verifyEmail(token).toPromise().then(
            (t: boolean) => t,
            () => false)
            .catch(
                () => false);
    }
}
