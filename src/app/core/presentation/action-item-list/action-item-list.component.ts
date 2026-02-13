import { Component, Input } from '@angular/core';
import { UserActionViewModelConfiguration, UserActionType } from '../../../shared/model/user-action.model';

@Component({
    selector: 'mibi-action-item-list',
    templateUrl: './action-item-list.component.html',
    styleUrls: ['./action-item-list.component.scss']
})
export class ActionItemListComponent {
    @Input() actionBarTitle: string;
    @Input() actionConfigs: UserActionViewModelConfiguration[];

    isUpload(actionType: UserActionType): boolean {
        return actionType === UserActionType.UPLOAD;
    }

    isDownloadTemplate(actionType: UserActionType): boolean {
        return actionType === UserActionType.DOWNLOAD_TEMPLATE;
    }

    isDownloadZomoPlanFile(actionType: UserActionType): boolean {
        return actionType === UserActionType.DOWNLOAD_ZOMO_PLAN_FILE;
    }

    zomoPlanFileConfigExists(): boolean {
        return this.downloadZomoPlanFileConfigs.length > 0;
    }

    get downloadTemplateConfigs() {
        return (this.actionConfigs ?? [])
            .filter(c => this.isDownloadTemplate(c.type));
    }

    get downloadZomoPlanFileConfigs() {
        return (this.actionConfigs ?? [])
            .filter(c => this.isDownloadZomoPlanFile(c.type));
    }

    get downloadZomoPlanFileConfig() {
        return this.downloadZomoPlanFileConfigs.length > 0 ? this.downloadZomoPlanFileConfigs[0] : null;
    }
}
