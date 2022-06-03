import { createAction, props } from '@ngrx/store';
import { DialogConfiguration } from '../dialog.model';

export const dialogOpenMTA = createAction(
    '[Shared/Dialog] Open Dialog',
    props<{target: string; configuration: DialogConfiguration }>()
);

export const dialogCancelMTA = createAction(
    '[Shared/Dialog] Cancel dialog',
    props<{target: string}>()
);

export const dialogConfirmMTA = createAction(
    '[Shared/Dialog] Confirm dialog',
    props<{target: string}>()
);
