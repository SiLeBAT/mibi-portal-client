import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataService } from '../../../core/services/data.service';
import { SystemInformationResponseDTO } from '../../../core/model/response.model';
import * as moment from 'moment';
import 'moment/locale/de';
import { BehaviorSubject } from 'rxjs';

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
    lastChangeObs = this.lastChange$.asObservable();
    serverVersion: string;
    clientVersion: string;
    isDataAvailable: boolean;
    private dateParseString = 'ddd MMM DD HH:mm:ss YYYY +-HHmm';
    private clientLastChange: moment.Moment;
    private serverLastChange: moment.Moment;

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        moment.locale('en');
        this.clientLastChange = moment(environment.lastChange, this.dateParseString);
        this.lastChange$ = new BehaviorSubject(this.clientLastChange);
        this.dataService.getSystemInfo().toPromise().then(
            (sysInfo: SystemInformationResponseDTO) => {
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
