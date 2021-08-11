import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { DialogAction, DialogActionTypes, DialogConfirmMTA, DialogOpenMTA } from '../../shared/dialog/state/dialog.actions';
import { NavigateAction, NavigateMSA } from '../../shared/navigate/navigate.actions';
import { ofTarget } from '../../shared/ngrx/multi-target-action';
import { DestroySampleSetSOA, SamplesMainAction } from '../state/samples.actions';
import { CloseSamplesAction, CloseSamplesActionTypes, CloseSamplesSSA } from './close-samples.actions';
import { closeSamplesConfirmDialogConfiguration } from './close-samples.constants';

@Injectable()
export class CloseSamplesEffects {

    private readonly CONFIRM_DIALOG_TARGET = 'Samples/CloseSamples/Confirm';

    constructor(
        private actions$: Actions<CloseSamplesAction>
    ) { }

    @Effect()
    closeSamples$: Observable<DialogAction> = this.actions$.pipe(
        ofType<CloseSamplesSSA>(CloseSamplesActionTypes.CloseSamplesSSA),
        map(() =>
            new DialogOpenMTA(this.CONFIRM_DIALOG_TARGET, { configuration: closeSamplesConfirmDialogConfiguration })
        )
    );

    @Effect()
    closeSamplesConfirm$: Observable<NavigateAction | SamplesMainAction> = this.actions$.pipe(
        ofType<DialogConfirmMTA>(DialogActionTypes.DialogConfirmMTA),
        ofTarget(this.CONFIRM_DIALOG_TARGET),
        concatMap(() => of(
            new NavigateMSA({ url: '/upload' }),
            new DestroySampleSetSOA()
        ))
    );
}
