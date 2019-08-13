import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as coreActions from './core.actions';
import { tap, pluck, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../../shared/presentation/dialog/dialog.component';
import { DialogContent } from '../model/dialog.model';

@Injectable()
export class CoreMainEffects {

    constructor(private actions$: Actions,
        private dialog: MatDialog) {
    }

    @Effect({ dispatch: false })
    displayDialog$ = this.actions$.pipe(
        ofType(coreActions.CoreMainActionTypes.DisplayDialog),
        pluck('payload'),
        tap((content: DialogContent) => {
            this.dialog.open(DialogComponent, {
                width: '400px',
                data: content
            });
        })
    );

}
