import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { tap, pluck } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../shared/presentation/dialog/dialog.component';
import { DialogContent } from './model/dialog.model';
import { CoreMainActionTypes } from './state/core.actions';

@Injectable()
export class CoreMainEffects {

    constructor(private actions$: Actions,
        private dialog: MatDialog) {
    }

    @Effect({ dispatch: false })
    displayDialog$ = this.actions$.pipe(
        ofType(CoreMainActionTypes.DisplayDialogMSA),
        pluck('payload'),
        tap((content: DialogContent) => {
            this.dialog.open(DialogComponent, {
                width: '400px',
                data: content
            });
        })
    );

}
