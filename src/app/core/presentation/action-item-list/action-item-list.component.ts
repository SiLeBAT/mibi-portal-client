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
}
