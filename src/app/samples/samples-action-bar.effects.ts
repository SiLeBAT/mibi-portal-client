import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { showActionBarSOA } from '../core/state/core.actions';
import { UserActionType } from '../shared/model/user-action.model';
import { samplesPaths } from './samples.paths';
import { SamplesMainSlice } from './samples.state';
import { selectImportedFileName } from './state/samples.selectors';

@Injectable()
export class SamplesActionBarEffects {

    setActionBarForUpload$ = createEffect(() => this.actions$.pipe(
        ofType(routerNavigatedAction),
        filter(action => action.payload.event.urlAfterRedirects.includes(samplesPaths.upload)),
        map(() => showActionBarSOA({
            title: '',
            enabledActions: [
                UserActionType.UPLOAD,
                UserActionType.DOWNLOAD_TEMPLATE
            ]
        }))
    ));

    setActionBarForEditor$ = createEffect(() => this.actions$.pipe(
        ofType(routerNavigatedAction),
        filter(action => action.payload.event.urlAfterRedirects.includes(samplesPaths.editor)),
        withLatestFrom(this.store$.select(selectImportedFileName)),
        map(([, fileName]) => showActionBarSOA({
            title: fileName,
            enabledActions: [
                UserActionType.SEND,
                UserActionType.VALIDATE,
                UserActionType.EXPORT,
                UserActionType.CLOSE,
                UserActionType.UPLOAD,
                UserActionType.DOWNLOAD_TEMPLATE,
                UserActionType.DOWNLOAD_ZOMO_PLAN_FILE
            ]
        }))
    ));

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice>
    ) {}
}
