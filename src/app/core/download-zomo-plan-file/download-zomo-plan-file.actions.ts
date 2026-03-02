import { createAction, props } from '@ngrx/store';
import { ZomoPlanFileInfo } from '../model/response.model';

export const downloadZomoPlanFileSSA = createAction(
    '[Core/DownloadZomoPlanFile] Download Zomo-Plan file',
    props<{ zomoPlanFileInfo: ZomoPlanFileInfo }>()
);
