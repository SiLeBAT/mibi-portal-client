import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserActionViewModelConfiguration } from '../../../shared/model/user-action.model';
import { ZomoPlanFileInfo } from '../../model/response.model';

@Component({
    selector: 'mibi-app-bar-top',
    templateUrl: './app-bar-top.component.html',
    styleUrls: ['./app-bar-top.component.scss']
})
export class AppBarTopComponent {
    @Input() actionBarEnabled: boolean;
    @Input() actionBarTitle: string;
    @Input() actionConfigs: UserActionViewModelConfiguration[];
    @Output() zomoPlanFileInfoChangeEvent = new EventEmitter<ZomoPlanFileInfo>();

    onDownloadZomoPlanFile(zomoPlanFileInfo: ZomoPlanFileInfo) {
        this.zomoPlanFileInfoChangeEvent.emit(zomoPlanFileInfo);
    }
}
