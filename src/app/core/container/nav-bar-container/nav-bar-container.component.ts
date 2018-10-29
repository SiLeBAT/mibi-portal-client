import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { INavBarConfiguration } from '../../presentation/nav-bar/nav-bar.component';
import { SampleData, ISampleSheet } from '../../../samples/model/sample-management.model';
import { Store, select } from '@ngrx/store';
import * as fromSamples from '../../../samples/state/samples.reducer';
import * as fromUser from '../../../user/state/user.reducer';
import * as samplesActions from '../../../samples/state/samples.actions';
import * as userActions from '../../../user/state/user.actions';
import { takeWhile, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { IUser } from '../../../user/model/user.model';

// TODO: Should have pass navBarConfig to presentational component, to make the presentational component more generic
@Component({
    selector: 'mibi-nav-bar-container',
    template: `<mibi-nav-bar
    [hasEntries$]="hasEntries$"
    [config]="viewConfig"
    [currentUser$]="currentUser$"
    (onValidate)="onValidate()"
    (onSend)="onSend()"
    (onExport)="onExport()"
    (onLogout)="onLogout()">
    </mibi-nav-bar>`
})
export class NavBarContainerComponent implements OnInit, OnDestroy {

    hasEntries$: Observable<boolean>;
    currentUser$: Observable<IUser | null>;
    private currentUser: IUser | null;
    private sampleData: SampleData[];
    private sampleSheet: ISampleSheet;
    private componentActive: boolean = true;
    private nrl: string = '';

    viewConfig: INavBarConfiguration = {
        appName: environment.appName
    };

    constructor(
        private router: Router,
        private store: Store<fromSamples.State>) { }

    ngOnInit() {
        this.store.pipe(select(fromSamples.getDataValues),
            takeWhile(() => this.componentActive)).subscribe(
                (data: SampleData[]) => this.sampleData = data
            );

        this.hasEntries$ = this.store.pipe(select(fromSamples.hasEntries));

        this.store.pipe(select(fromSamples.getSamplesFeatureState),
            takeWhile(() => this.componentActive)).subscribe(
                (sheet: ISampleSheet) => this.sampleSheet = sheet
            );

        this.currentUser$ = this.store.pipe(
            select(fromUser.getCurrentUser),
            tap(cu => this.currentUser = cu)
        );

        this.store.pipe(select(fromSamples.getNRL),
            takeWhile(() => this.componentActive)).subscribe(
                (nrl: string) => this.nrl = nrl
            );

    }

    ngOnDestroy(): void {
        this.componentActive = false;
    }

    onValidate() {
        this.store.dispatch(new samplesActions.ValidateSamples({
            data: this.sampleData,
            meta: {
                state: this.currentUser ? this.currentUser.institution.stateShort : '',
                nrl: this.nrl
            }
        }));
        this.router.navigate(['/samples']).catch(
            err => { throw err; }
        );
    }

    onExport() {
        this.store.dispatch(new samplesActions.ExportExcelFile(this.sampleSheet));
    }

    onSend() {
        this.store.dispatch(new samplesActions.SendSamplesInitiate({
            data: this.sampleData,
            meta: {
                state: this.currentUser ? this.currentUser.institution.stateShort : '',
                nrl: this.nrl
            }
        }));
    }

    onLogout() {
        this.store.dispatch(new userActions.LogoutUser());
    }
}
