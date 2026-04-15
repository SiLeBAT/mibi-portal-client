import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserActionViewModelConfiguration, UserActionType } from '../../../shared/model/user-action.model';
import { ZomoPlanFileInfo } from '../../model/response.model';

@Component({
    selector: 'mibi-action-item-list',
    templateUrl: './action-item-list.component.html',
    styleUrls: ['./action-item-list.component.scss']
})
export class ActionItemListComponent {
    @Input() actionBarTitle: string;
    @Input() actionConfigs: UserActionViewModelConfiguration[];
    @Output() zomoPlanFileInfoChangeEvent = new EventEmitter<ZomoPlanFileInfo>();

    isUpload(actionType: UserActionType): boolean {
        return actionType === UserActionType.UPLOAD;
    }

    isDownloadZomoPlanFile(actionType: UserActionType): boolean {
        return actionType === UserActionType.DOWNLOAD_ZOMO_PLAN_FILE;
    }

    zomoPlanFileConfigExists(): boolean {
        return this.downloadZomoPlanFileConfigs.length > 0;
    }

    get downloadZomoPlanFileConfigs() {
        return (this.actionConfigs ?? [])
            .filter(c => this.isDownloadZomoPlanFile(c.type));
    }

    get downloadZomoPlanFileConfig() {
        return this.downloadZomoPlanFileConfigs.length > 0 ? this.downloadZomoPlanFileConfigs[0] : null;
    }

    onDownloadZomoPlanFile(zomoPlanFileInfo: ZomoPlanFileInfo) {
        this.zomoPlanFileInfoChangeEvent.emit(zomoPlanFileInfo);
    }
}
