import { createAction, props } from '@ngrx/store';
import { DialogContent } from '../model/dialog.model';
import { Banner, BannerType } from '../model/alert.model';
import { ZomoPlanFileInfo } from '../model/response.model';


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

export const showDialogMSA = createAction(
    '[Core] Display Dialog',
    props<{ content: DialogContent }>()
);

export const updateIsBusySOA = createAction(
    '[Core] Show or hide Busy Spinner',
    props<{ isBusy: boolean }>()
);

export const updateClientDashboardInfoSOA = createAction(
    '[Core] Update Client Dashboard Info Status',
    props<{ alternativeWelcomePage: boolean }>()
);

export const updateZomoPlanFilesSOA = createAction(
    '[Core] Update Available Zomo Plan Files',
    props<{ zomoPlanFiles: ZomoPlanFileInfo[] }>()
);

export const updateWelcomePageSOA = createAction(
    '[Core] Update Welcome Page',
    props<{ isMaintenance: boolean; content: string }>()
);
