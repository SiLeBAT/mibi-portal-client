import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, concatMap, endWith, startWith } from 'rxjs/operators';
import { DataService } from '../../core/services/data.service';
import { LogService } from '../../core/services/log.service';
import { hideBannerSOA, showBannerSOA, updateIsBusySOA } from '../../core/state/core.actions';
import { saveAs } from 'file-saver';
import { downloadZomoPlanFileSSA } from './download-zomo-plan-file.actions';
import { ZomoPlanFileInfo, ZomoPlanFileData } from '../model/response.model';

@Injectable()
export class DownloadZomoPlanFileEffects {

    constructor(
        private actions$: Actions,
        private dataService: DataService,
        private logger: LogService
    ) { }

    downloadZomoPlanFile$ = createEffect(() => this.actions$.pipe(
        ofType(downloadZomoPlanFileSSA),
        concatMap(action => this.downloadZomoPlanFile(action.zomoPlanFileInfo).pipe(
            startWith(
                updateIsBusySOA({ isBusy: true }),
                hideBannerSOA()
            ),
            endWith(
                updateIsBusySOA({ isBusy: false })
            )
        ))
    ));

    private downloadZomoPlanFile(zomoPlanFileInfo: ZomoPlanFileInfo): Observable<Action> {
        return this.dataService.downloadZomoPlanFile(zomoPlanFileInfo).pipe(
            concatMap((response: ZomoPlanFileData) => {
                saveAs(response.blob, response.fileName);
                return EMPTY;
            }),
            catchError((error) => {
                this.logger.error('Failed to download Zomo-Plan file ', error.stack);
                return of(showBannerSOA({ predefined: 'downloadFailure' }));
            })
        );
    }
}
