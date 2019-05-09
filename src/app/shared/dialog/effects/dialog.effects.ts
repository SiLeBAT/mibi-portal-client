import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DialogAction, DialogActionTypes } from '../state/dialog.actions';
import { Observable } from 'rxjs';
import { NewDialogComponent } from '../container/dialog.component';
import { map } from 'rxjs/operators';
import { DialogService } from '../services/dialog.service';

@Injectable()
export class DialogEffects {

    constructor(private actions$: Actions<DialogAction>,
        private dialogService: DialogService) {
    }

    @Effect({ dispatch: false })
    dialogOpen$: Observable<void> = this.actions$.pipe(
        ofType(DialogActionTypes.DialogOpen),
        map(() => {
            this.dialogService.openDialog(NewDialogComponent);
        })
    );
}
