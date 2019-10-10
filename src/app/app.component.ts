import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../environments/environment';
import { GuardedUnloadComponent } from './shared/container/guarded-unload.component';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap } from 'rxjs/operators';
import { DataService } from './core/services/data.service';
import * as userActions from './user/state/user.actions';
import { TokenizedUser } from './user/model/user.model';
import { SamplesMainSlice } from './samples/samples.state';
import { selectHasEntries } from './samples/state/samples.selectors';
import { UpdateIsBusySOA, DestroyBannerSOA, DisplayBannerSOA } from './core/state/core.actions';

@Component({
    selector: 'mibi-root',
    templateUrl: './app.component.html'
})
export class AppComponent extends GuardedUnloadComponent implements OnInit, OnDestroy {

    supportContact: string = environment.supportContact;
    private componentActive = true;
    private canUnload: boolean = true;
    constructor(private store$: Store<SamplesMainSlice>, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.store$.pipe(select(selectHasEntries),
            tap(
                entries => this.canUnload = !entries
            ),
            takeWhile(() => this.componentActive)
        ).subscribe();

        this.loadInstitutions();
        this.loadUser();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    unloadGuard(): boolean {
        return this.canUnload;
    }

    private loadInstitutions() {
        this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
        this.dataService.getAllInstitutions().toPromise().then(
            data => {
                this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(new userActions.UpdateInstitutionsSOA(data));
            }
        ).catch(
            () => {
                this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(new DisplayBannerSOA({ predefined: 'defaultError' }));
                throw new Error();
            }
        );
    }

    private loadUser() {
        const userJson: string | null = localStorage.getItem('currentUser');
        if (!userJson) {
            return;
        }
        const user: TokenizedUser = JSON.parse(userJson);

        this.store$.dispatch(new UpdateIsBusySOA({ isBusy: true }));
        this.dataService.refreshToken().toPromise().then(
            refreshResponse => {
                this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                if (refreshResponse.refresh) {
                    user.token = refreshResponse.token;
                    this.dataService.setCurrentUser(user);
                    this.store$.dispatch(new userActions.UpdateCurrentUserSOA(user));
                    this.store$.dispatch(new DestroyBannerSOA());
                } else {
                    this.store$.dispatch(new userActions.LogoutUserMSA());
                }
            }
        ).catch(
            () => {
                this.store$.dispatch(new UpdateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(new userActions.LogoutUserMSA());
            }
        );
    }
}
