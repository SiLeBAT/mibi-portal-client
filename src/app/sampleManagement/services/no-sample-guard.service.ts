import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SampleStore } from './sample-store.service';

@Injectable()
export class NoSampleGuard implements CanActivate {

    constructor(private router: Router, private sampleStore: SampleStore) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (this.sampleStore.hasEntries) {
            return true;
        }

        this.router.navigate(['/upload']).catch(() => {
            throw new Error('Unable to navigate.');
        });
        return false;
    }
}
