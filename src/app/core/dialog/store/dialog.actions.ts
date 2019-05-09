import { CommandAction, ResponseAction } from '../../../shared/command/command.actions';
import { DialogConfiguration } from '../model/dialog-config.model';

export enum DialogActionTypes {
    DialogOpen = '[Core/Dialog] Open Dialog',
    DialogConfirm = '[Core/Dialog] Confirm button clicked',
    DialogCancel = '[Core/Dialog] Cancel button clicked'
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
