import { MultiTargetAction } from '../../ngrx/multi-target-action';
import { DialogConfiguration } from '../dialog.model';

export enum DialogActionTypes {
    DialogOpenMTA = '[Shared/Dialog] Open Dialog',
    DialogCancelMTA = '[Shared/Dialog] Cancel dialog',
    DialogConfirmMTA = '[Shared/Dialog] Confirm dialog'
}
export class DialogOpenMTA implements MultiTargetAction {
    readonly type = DialogActionTypes.DialogOpenMTA;

    constructor(public target: string, public payload: { configuration: DialogConfiguration }) { }
}

export class DialogCancelMTA implements MultiTargetAction {
    readonly type = DialogActionTypes.DialogCancelMTA;

    constructor(public target: string) { }
}

export class DialogConfirmMTA implements MultiTargetAction {
    readonly type = DialogActionTypes.DialogConfirmMTA;

    constructor(public target: string) { }
}

export type DialogAction = DialogOpenMTA | DialogCancelMTA | DialogConfirmMTA;
