import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { DialogConfiguration } from '../../shared/dialog/dialog.model';
import { dialogConfirmMTA, dialogOpenMTA } from '../../shared/dialog/state/dialog.actions';
import { navigateMSA } from '../../shared/navigate/navigate.actions';
import { ofTarget } from '../../shared/ngrx/multi-target-action';
import { samplesDestroyMainDataSOA } from '../state/samples.actions';
import { closeSamplesSSA } from './close-samples.actions';
import { closeSamplesConfirmDialogStrings } from './close-samples.constants';

@Injectable()
export class CloseSamplesEffects {

    private readonly CONFIRM_DIALOG_TARGET = 'Samples/CloseSamples/Confirm';

    constructor(
        private actions$: Actions
    ) { }

    closeSamples$ = createEffect(() => this.actions$.pipe(
        ofType(closeSamplesSSA),
        map(() => dialogOpenMTA({
            target: this.CONFIRM_DIALOG_TARGET,
            configuration: this.createConfirmDialogConfiguration()
        }))
    ));

    closeSamplesConfirm$ = createEffect(() => this.actions$.pipe(
        ofType(dialogConfirmMTA),
        ofTarget(this.CONFIRM_DIALOG_TARGET),
        concatMap(() => of(
            navigateMSA({ url: '/upload' }),
            samplesDestroyMainDataSOA()
        ))
    ));

    private createConfirmDialogConfiguration(): DialogConfiguration {
        const strings = closeSamplesConfirmDialogStrings;
        return {
            title: strings.title,
            message: strings.message,
            confirmButtonConfig: {
                label: strings.confirmButtonLabel
            },
            cancelButtonConfig: {
                label: strings.cancelButtonLabel
            },
            warnings: []
        };
    }
}
