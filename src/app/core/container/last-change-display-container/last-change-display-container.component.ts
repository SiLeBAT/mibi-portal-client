import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataService } from '../../../core/services/data.service';
import * as moment from 'moment';
import 'moment/locale/de';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { SystemInformation } from '../../model/system-information.model';
import { CoreMainState } from '../../state/core.reducer';
import { UpdateSupportDetailSOA } from '../../../content/state/content.actions';

@Component({
    selector: 'mibi-last-change-display-container',
    template: `<mibi-last-change-display
    *ngIf="isDataAvailable"
    [lastChange$]="lastChangeObs"
    [serverVersion]="serverVersion"
    [clientVersion]="clientVersion"></mibi-last-change-display>`
})
export class LastChangeDisplayContainerComponent implements OnInit {

    private lastChange$: BehaviorSubject<moment.Moment>;
    lastChangeObs: Observable<moment.Moment>;
    serverVersion: string;
    clientVersion: string;
    isDataAvailable: boolean;
    private dateParseString = 'YYYY-MM-DD HH:mm:ss +-HHmm';
    private clientLastChange: moment.Moment;
    private serverLastChange: moment.Moment;

    constructor(private store$: Store<CoreMainState>, private dataService: DataService) { }

    ngOnInit(): void {
        moment.locale('en');
        this.clientLastChange = moment(environment.lastChange, this.dateParseString);
        this.lastChange$ = new BehaviorSubject(this.clientLastChange);
        this.lastChangeObs = this.lastChange$.asObservable();
        this.dataService.getSystemInfo().toPromise().then(
            (sysInfo: SystemInformation) => {
                this.serverLastChange = moment(sysInfo.lastChange, this.dateParseString);
                const dateCompare = [];
                if (this.serverLastChange.isValid()) {
                    dateCompare.push(this.serverLastChange);
                }
                if (this.clientLastChange.isValid()) {
                    dateCompare.push(this.clientLastChange);
                }
                this.lastChange$.next(moment.max(dateCompare));
                this.serverVersion = sysInfo.version;
                this.isDataAvailable = true;
                this.store$.dispatch(new UpdateSupportDetailSOA({ supportContact: sysInfo.supportContact }));
            }
        ).catch(
            () => {
                this.serverVersion = '';
                this.isDataAvailable = true;
            }
        );
        this.clientVersion = environment.version;
    }
}
