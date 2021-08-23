import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { NewDialogComponent } from './components/dialog.component';
import { concatMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { dialogOpenMTA } from './state/dialog.actions';

@Injectable()
export class DialogEffects {

    constructor(
        private actions$: Actions,
        private dialogService: DialogService
    ) { }

    dialogOpen$ = createEffect(() => this.actions$.pipe(
        ofType(dialogOpenMTA),
        concatMap(() => {
            this.dialogService.openDialog(NewDialogComponent);
            return EMPTY;
        })
    ), { dispatch: false });
}
