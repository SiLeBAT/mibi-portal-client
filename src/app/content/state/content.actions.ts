import { Action } from '@ngrx/store';
import { SupportDetail } from '../model/support-detail.model';

export enum ContentMainActionTypes {
    UpdateSupportDetailSOA = '[Content] Update Support detail'
}
export class UpdateSupportDetailSOA implements Action {
    readonly type = ContentMainActionTypes.UpdateSupportDetailSOA;

    constructor(public payload: SupportDetail) { }
}

export type ContentMainAction = UpdateSupportDetailSOA;
