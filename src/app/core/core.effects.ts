import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/presentation/dialog/dialog.component';
import { showDialogMSA } from './state/core.actions';
import { EMPTY } from 'rxjs';

@Injectable()
export class CoreMainEffects {

    constructor(private actions$: Actions,
        private dialog: MatDialog) {
    }

    displayDialog$ = createEffect(() => this.actions$.pipe(
        ofType(showDialogMSA),
        concatMap(action => {
            this.dialog.open(DialogComponent, {
                width: '400px',
                data: action.content
            });
            return EMPTY;
        })
    ), { dispatch: false });
}
