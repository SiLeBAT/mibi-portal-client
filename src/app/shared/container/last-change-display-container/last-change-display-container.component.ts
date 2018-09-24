import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { DataService } from '../../../core/services/data.service';
import { ISystemInformationResponseDTO } from '../../../core/model/response.model';
import * as moment from 'moment';

@Component({
    selector: 'mibi-last-change-display-container',
    template: `<mibi-last-change-display
    *ngIf="isDataAvailable"
    [lastChange]="lastChange"
    [serverVersion]="serverVersion"
    [clientVersion]="clientVersion"></mibi-last-change-display>`
})
export class LastChangeDisplayContainerComponent implements OnInit {

    lastChange: moment.Moment;
    serverVersion: string;
    clientVersion: string;
    isDataAvailable: boolean;
    private dateParseString = 'ddd MMM DD HH:mm:ss YYYY +-HHmm';
    private clientLastChange: moment.Moment;
    private serverLastChange: moment.Moment;

    constructor(private dataService: DataService) { }

    ngOnInit(): void {
        this.clientLastChange = moment(environment.lastChange, this.dateParseString);
        this.dataService.getSystemInfo().toPromise().then(
            (sysInfo: ISystemInformationResponseDTO) => {
                this.serverLastChange = moment(sysInfo.lastChange, this.dateParseString);
                this.lastChange = moment.max(this.serverLastChange, this.clientLastChange);
                this.serverVersion = sysInfo.version;
                this.isDataAvailable = true;
            }
        ).catch(
            () => {
                this.serverVersion = '';
                this.isDataAvailable = true;
                this.lastChange = this.clientLastChange;
            }
        );
        this.clientVersion = environment.version;
    }
}
