import { Action } from '@ngrx/store';

export enum NavigateActionTypes {
    NavigateMSA = '[Shared/Navigate] Navigate to url'
}

export class NavigateMSA implements Action {
    readonly type = NavigateActionTypes.NavigateMSA;

    constructor(public payload: { url: string }) { }
}

export type NavigateAction = NavigateMSA;
