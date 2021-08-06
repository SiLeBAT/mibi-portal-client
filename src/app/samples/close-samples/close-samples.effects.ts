import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { NavigationService } from '../../core/services/navigation.service';
import { DialogActionTypes, DialogConfirmMTA, DialogOpenMTA } from '../../shared/dialog/state/dialog.actions';
import { ofTarget } from '../../shared/ngrx/multi-target-action';
import { DestroySampleSetSOA } from '../state/samples.actions';
import { CloseSamplesAction, CloseSamplesActionTypes, CloseSamplesSSA } from './close-samples.actions';
import { closeSamplesConfirmDialogConfiguration } from './close-samples.constants';

@Injectable()
export class CloseSamplesEffects {

    private readonly CONFIRM_DIALOG_TARGET = 'Samples/CloseSamples/Confirm';

    constructor(
        private actions$: Actions<CloseSamplesAction>,
        private navigationService: NavigationService
    ) { }

    @Effect()
    closeSamples$: Observable<DialogOpenMTA> = this.actions$.pipe(
        ofType<CloseSamplesSSA>(CloseSamplesActionTypes.CloseSamplesSSA),
        map(() =>
            new DialogOpenMTA(this.CONFIRM_DIALOG_TARGET, { configuration: closeSamplesConfirmDialogConfiguration })
        )
    );

    @Effect()
    closeSamplesConfirm$: Observable<DestroySampleSetSOA> = this.actions$.pipe(
        ofType<DialogConfirmMTA>(DialogActionTypes.DialogConfirmMTA),
        ofTarget(this.CONFIRM_DIALOG_TARGET),
        concatMap(() => this.navigationService.navigate('/upload').pipe(
            map(() => new DestroySampleSetSOA()),
            catchError(() => of(new DestroySampleSetSOA()))
        ))
    );
}
