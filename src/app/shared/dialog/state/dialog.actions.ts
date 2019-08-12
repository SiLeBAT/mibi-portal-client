import { CommandAction, ResponseAction } from '../../../shared/command/command.actions';
import { DialogConfiguration } from '../dialog.model';

export enum DialogActionTypes {
    DialogOpen = '[Shared/Dialog] Open Dialog',
    DialogConfirm = '[Shared/Dialog] Confirm button clicked',
    DialogCancel = '[Shared/Dialog] Cancel button clicked'
}
export class DialogOpen implements CommandAction {
    readonly type = DialogActionTypes.DialogOpen;

    constructor(public source: string, public payload: { configuration: DialogConfiguration }) { }
}

export class DialogConfirm implements ResponseAction {
    readonly type = DialogActionTypes.DialogConfirm;
    readonly command = DialogActionTypes.DialogOpen;
}

export class DialogCancel implements ResponseAction {
    readonly type = DialogActionTypes.DialogCancel;
    readonly command = DialogActionTypes.DialogOpen;
}

export type DialogAction = DialogOpen | DialogConfirm | DialogCancel;
