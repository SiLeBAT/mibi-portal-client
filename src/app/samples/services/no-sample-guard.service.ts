import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { SamplesLinkProviderService } from '../link-provider.service';
import { SamplesMainSlice } from '../samples.state';
import { selectHasEntries } from '../state/samples.selectors';

@Injectable({
    providedIn: 'root'
})
export class NoSampleGuard {

    constructor(
        private store$: Store<SamplesMainSlice>,
        private router: Router,
        private samplesLinks: SamplesLinkProviderService
    ) {}

    async canActivate(): Promise<boolean | UrlTree> {
        const hasEntries = await firstValueFrom(this.store$.pipe(select(selectHasEntries)));
        return hasEntries ? true : this.router.parseUrl(this.samplesLinks.upload);
    }
}
