import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DialogAction, DialogActionTypes } from './dialog.actions';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { NewDialogComponent } from '../container/dialog.component';
import { dialogMatConfiguration } from '../constants/dialog-mat-config.constants';
import { map } from 'rxjs/operators';
import { DialogService } from '../services/dialog.service';

@Injectable()
export class DialogEffects {

    constructor(private actions$: Actions<DialogAction>,
        private dialogService: DialogService) {
    }

    @Effect({ dispatch: false })
    open$: Observable<void> = this.actions$.pipe(
        ofType(DialogActionTypes.DialogOpen),
        map(() => {
            this.dialogService.openDialog(NewDialogComponent);
        })
    );
}
