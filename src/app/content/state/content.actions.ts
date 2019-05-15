import { Action } from '@ngrx/store';

export enum ContentMainActionTypes {
    UpdateSupportDetail = '[Content] Update Support detail'
}
export class UpdateSupportDetail implements Action {
    readonly type = ContentMainActionTypes.UpdateSupportDetail;

    constructor(public payload: string) {

    }
}

export type ContentMainAction = UpdateSupportDetail;
