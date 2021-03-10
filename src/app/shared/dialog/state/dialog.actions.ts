import { MultiTargetAction } from '../../ngrx/multi-target-action';
import { DialogConfiguration } from '../dialog.model';

export enum DialogActionTypes {
    DialogOpenMTA = '[Shared/Dialog] Open Dialog',
    DialogConfirmMTA = '[Shared/Dialog] Inform of dialog confirmed',
    DialogCancelMTA = '[Shared/Dialog] Inform of dialog cancelled'
}
export class DialogOpenMTA implements MultiTargetAction {
    readonly type = DialogActionTypes.DialogOpenMTA;

    constructor(public target: string, public payload: { configuration: DialogConfiguration, closable?: boolean }) { }
}

export class DialogConfirmMTA implements MultiTargetAction {
    readonly type = DialogActionTypes.DialogConfirmMTA;

    constructor(public target: string) { }
}

export class DialogCancelMTA implements MultiTargetAction {
    readonly type = DialogActionTypes.DialogCancelMTA;

    constructor(public target: string) { }
}

export type DialogAction = DialogOpenMTA | DialogConfirmMTA | DialogCancelMTA;
