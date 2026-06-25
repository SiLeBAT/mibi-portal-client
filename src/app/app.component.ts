import { Component, OnInit, OnDestroy } from '@angular/core';
import { GuardedUnloadComponent } from './shared/container/guarded-unload.component';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap } from 'rxjs/operators';
import { SamplesMainSlice } from './samples/samples.state';
import { selectHasEntries } from './samples/state/samples.selectors';
import { initSSA } from './main/init/init.actions';
import { DataConsentService } from './user/services/data-consent.service';

@Component({
    standalone: false,
    selector: 'mibi-root',
    templateUrl: './app.component.html'
})
export class AppComponent extends GuardedUnloadComponent implements OnInit, OnDestroy {

    private componentActive = true;
    private canUnload: boolean = true;

    constructor(
        private store$: Store<SamplesMainSlice>,
        private dataConsentService: DataConsentService
    ) {
        super();
    }

    ngOnInit(): void {
        this.store$.pipe(select(selectHasEntries),
            tap(
                entries => this.canUnload = !entries
            ),
            takeWhile(() => this.componentActive)
        ).subscribe();

        this.store$.dispatch(initSSA());

        // Show the data-save consent popup once a user is present and has not
        // yet made a choice (covers both legacy login and Keycloak bootstrap).
        this.dataConsentService.monitor();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    unloadGuard(): boolean {
        return this.canUnload;
    }
}
