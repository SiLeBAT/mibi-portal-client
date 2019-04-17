import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { environment } from '../environments/environment';
import { GuardedUnloadComponent } from './shared/container/guarded-unload.component';
import { Store, select } from '@ngrx/store';
import { takeWhile, tap } from 'rxjs/operators';
import * as fromSamples from './samples/state/samples.reducer';
import { DataService } from './core/services/data.service';
import * as userActions from './user/state/user.actions';
import { TokenizedUser } from './user/model/user.model';

@Component({
    selector: 'mibi-root',
    templateUrl: './app.component.html'
})
export class AppComponent extends GuardedUnloadComponent implements OnInit, OnDestroy, AfterViewInit {

    supportContact: string = environment.supportContact;
    private componentActive = true;
    private canUnload: boolean = true;
    constructor(private store$: Store<fromSamples.State>, private dataService: DataService) {
        super();
    }

    ngOnInit(): void {
        this.store$.pipe(select(fromSamples.hasEntries),
            tap(
                hasEntries => this.canUnload = !hasEntries
            ),
            takeWhile(() => this.componentActive)
        ).subscribe();

        this.loadInstitutions();
    }

    ngAfterViewInit(): void {
        this.loadUser();
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    unloadGuard(): boolean {
        return this.canUnload;
    }

    private loadInstitutions() {
        this.dataService.getAllInstitutions().toPromise().then(
            data => {
                this.store$.dispatch(new userActions.PopulateInstitutions(data));
            }
        ).catch(
            () => { throw new Error(); }
        );
    }

    private loadUser() {
        const userJson: string | null = localStorage.getItem('currentUser');
        if (!userJson) {
            return;
        }
        const user: TokenizedUser = JSON.parse(userJson);

        this.dataService.isAuthorized(user).toPromise().then(
            authorizationResponse => {
                if (authorizationResponse.authorized) {
                    user.token = authorizationResponse.token;
                    this.dataService.setCurrentUser(user);
                    this.store$.dispatch(new userActions.LoginUserSuccess(user));
                } else {
                    this.store$.dispatch(new userActions.LogoutUser());
                }
            }
        ).catch(
            () => {
                this.store$.dispatch(new userActions.LogoutUser());
            }
        );
    }
}
