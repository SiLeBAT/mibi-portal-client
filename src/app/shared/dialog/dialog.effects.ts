import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DialogAction, DialogActionTypes } from './state/dialog.actions';
import { EMPTY, Observable } from 'rxjs';
import { NewDialogComponent } from './components/dialog.component';
import { concatMap } from 'rxjs/operators';
import { DialogService } from './dialog.service';

@Injectable()
export class DialogEffects {

    constructor(
        private actions$: Actions<DialogAction>,
        private dialogService: DialogService
    ) { }

    @Effect()
    dialogOpen$: Observable<never> = this.actions$.pipe(
        ofType(DialogActionTypes.DialogOpenMTA),
        concatMap(() => {
            this.dialogService.openDialog(NewDialogComponent);
            return EMPTY;
        })
    );
}
