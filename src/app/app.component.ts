import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../environments/environment';
import { GuardedUnloadComponent } from './shared/container/guarded-unload.component';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap } from 'rxjs/operators';
import * as fromSamples from './samples/state/samples.reducer';
import { DataService } from './core/services/data.service';
import * as userActions from './user/state/user.actions';

@Component({
    selector: 'mibi-root',
    templateUrl: './app.component.html'
})
export class AppComponent extends GuardedUnloadComponent implements OnInit, OnDestroy {

    supportContact: string = environment.supportContact;
    private componentActive = true;
    private canUnload: boolean = true;
    constructor(private store: Store<fromSamples.State>, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.store.pipe(select(fromSamples.hasEntries),
            takeWhile(() => this.componentActive),
            tap(
                hasEntries => this.canUnload = !hasEntries
            )
        ).subscribe();

        this.dataService.getAllInstitutions().toPromise().then(
            data => {
                this.store.dispatch(new userActions.PopulateInstitutions(data));
            }
        ).catch(
            () => { throw new Error(); }
        );
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    unloadGuard(): boolean {
        return this.canUnload;
    }
}
