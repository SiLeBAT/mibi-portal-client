import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { actionBarMenuEntrySelectedMSA } from '../../main/state/action-bar.actions';
import { CoreMainSlice } from '../core.state';
import { selectZomoPlanFiles } from '../state/core.selectors';
import { downloadZomoPlanFileItemId } from './download-zomo-plan-file.action-bar';
import { downloadZomoPlanFileSSA } from './download-zomo-plan-file.actions';

/**
 * Turns a choice made on this feature's action bar item into a download.
 */
@Injectable()
export class DownloadZomoPlanFileActionBarEffects {

    downloadChosenZomoPlanFile$ = createEffect(() => this.actions$.pipe(
        ofType(actionBarMenuEntrySelectedMSA),
        filter(action => action.id === downloadZomoPlanFileItemId),
        withLatestFrom(this.store$.select(selectZomoPlanFiles)),
        map(([action, zomoPlanFiles]) =>
            zomoPlanFiles.find(file => file.id === action.entryId)
        ),
        filter(zomoPlanFile => zomoPlanFile !== undefined),
        map(zomoPlanFile => downloadZomoPlanFileSSA({ zomoPlanFileInfo: zomoPlanFile }))
    ));

    constructor(
        private actions$: Actions,
        private store$: Store<CoreMainSlice>
    ) {}
}
