import { createAction, props } from '@ngrx/store';
import { DialogContent } from '../model/dialog.model';
import { UserActionType } from '../../shared/model/user-action.model';
import { Banner, BannerType } from '../model/alert.model';

export const showBannerSOA = createAction(
    '[Core] Create and show Banner',
    props<{ predefined: BannerType }>()
);

export const showCustomBannerSOA = createAction(
    '[Core] Create and show Custom Banner',
    props<{ banner: Banner }>()
);

export const hideBannerSOA = createAction(
    '[Core] Hide Banner'
);

export const destroyBannerSOA = createAction(
    '[Core] Destroy Banner'
);

export const showActionBarSOA = createAction(
    '[Core] Show Action Bar',
    props<{ title: string; enabledActions: UserActionType[] }>()
);

export const updateActionBarTitleSOA = createAction(
    '[Core] Update Action Bar Title',
    props<{ title: string }>()
);

export const showDialogMSA = createAction(
    '[Core] Display Dialog',
    props<{ content: DialogContent }>()
);

export const updateIsBusySOA = createAction(
    '[Core] Show or hide Busy Spinner',
    props<{ isBusy: boolean }>()
);
