import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { environment } from '../environments/environment';
import { GuardedUnloadComponent } from './shared/container/guarded-unload.component';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap } from 'rxjs/operators';
import { DataService } from './core/services/data.service';
import { TokenizedUser } from './user/model/user.model';
import { SamplesMainSlice } from './samples/samples.state';
import { selectHasEntries } from './samples/state/samples.selectors';
import { updateIsBusySOA, showBannerSOA } from './core/state/core.actions';
import { userForceLogoutMSA, userUpdateCurrentUserSOA, userUpdateInstitutionsSOA } from './user/state/user.actions';
import { nrlUpdateNrlsSOA } from './shared/nrl/state/nrl.actions';

@Component({
    selector: 'mibi-root',
    templateUrl: './app.component.html'
})
export class AppComponent extends GuardedUnloadComponent implements OnInit, OnDestroy {
    @HostBinding('@.disabled')
    animationsDisabled: boolean;

    supportContact: string = environment.supportContact;

    private readonly isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);

    private componentActive = true;
    private canUnload: boolean = true;

    constructor(private store$: Store<SamplesMainSlice>, private dataService: DataService) {
        super();
        this.animationsDisabled = this.isIEOrEdge;
    }

    ngOnInit(): void {
        this.store$.pipe(select(selectHasEntries),
            tap(
                entries => this.canUnload = !entries
            ),
            takeWhile(() => this.componentActive)
        ).subscribe();

        this.loadInstitutions();
        this.loadNRLs();
        this.loadUser();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    unloadGuard(): boolean {
        return this.canUnload;
    }

    private loadInstitutions() {
        this.store$.dispatch(updateIsBusySOA({ isBusy: true }));
        this.dataService.getAllInstitutions().toPromise().then(
            institutions => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(userUpdateInstitutionsSOA({ institutions: institutions }));
            }
        ).catch(
            () => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(showBannerSOA({ predefined: 'defaultError' }));
                throw new Error('Unable to fetch institutions');
            }
        );
    }

    private loadNRLs() {
        this.dataService.getAllNRLs().toPromise().then(
            data => {
                this.store$.dispatch(nrlUpdateNrlsSOA({ nrlDTO: data }));
            }
        ).catch(
            () => { throw new Error('Unable to fetch nrls'); }
        );
    }

    private loadUser() {
        const userJson: string | null = localStorage.getItem('currentUser');
        if (!userJson) {
            return;
        }
        const user: TokenizedUser = JSON.parse(userJson);

        this.store$.dispatch(updateIsBusySOA({ isBusy: true }));
        this.dataService.refreshToken().toPromise().then(
            refreshResponse => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                if (refreshResponse.refresh) {
                    user.token = refreshResponse.token;
                    this.dataService.setCurrentUser(user);
                    this.store$.dispatch(userUpdateCurrentUserSOA({ user: user }));
                } else {
                    this.store$.dispatch(userForceLogoutMSA());
                }
            }
        ).catch(
            () => {
                this.store$.dispatch(updateIsBusySOA({ isBusy: false }));
                this.store$.dispatch(userForceLogoutMSA());
            }
        );
    }
}
