import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataService } from '../../../core/services/data.service';
import moment from 'moment';
import 'moment/locale/de';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { SystemInformation } from '../../model/system-information.model';
import { updateSupportDetailSOA } from '../../../content/state/content.actions';
import { SupportDetail } from '../../../content/model/support-detail.model';
import { parseLastChange } from '../../model/last-change';

@Component({
    standalone: false,
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
    private clientLastChange: moment.Moment;
    private serverLastChange: moment.Moment;

    constructor(private store$: Store, private dataService: DataService) { }

    ngOnInit(): void {
        moment.locale('en');
        this.clientLastChange = parseLastChange(environment.lastChange);
        this.lastChange$ = new BehaviorSubject(this.clientLastChange);
        this.lastChangeObs = this.lastChange$.asObservable();
        this.dataService.getSystemInfo().toPromise().then(
            (sysInfo: SystemInformation) => {
                this.serverLastChange = parseLastChange(sysInfo.lastChange);
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
                const supportDetail: SupportDetail = {
                    supportContact: sysInfo.supportContact
                };
                this.store$.dispatch(updateSupportDetailSOA({ supportDetail: supportDetail }));
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
