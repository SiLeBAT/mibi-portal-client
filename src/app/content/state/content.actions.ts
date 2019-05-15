import { Action } from '@ngrx/store';
import { SupportDetail } from '../model/support-detail.model';

export enum ContentMainActionTypes {
    UpdateSupportDetail = '[Content] Update Support detail'
}
export class UpdateSupportDetail implements Action {
    readonly type = ContentMainActionTypes.UpdateSupportDetail;

    constructor(public payload: SupportDetail) {

    }
}

export type ContentMainAction = UpdateSupportDetail;
