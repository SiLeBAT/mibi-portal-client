import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';

@Component({
    selector: 'mibi-server-version-display-container',
    template: `<mibi-version-display [artifact]="artifact" [version]="version"></mibi-version-display>`
})
export class ServerVersionDisplayContainerComponent implements OnInit {
    artifact = 'mibi-server';
    version: string = '';
    constructor(private dataService: DataService) { }

    ngOnInit() {
        this.dataService.getSystemInfo().toPromise().then(
            sysInfo => this.version = sysInfo.version
        ).catch(
            () => this.version = '???'
        );
    }

}
