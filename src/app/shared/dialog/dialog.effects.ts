import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { DialogAction, DialogActionTypes } from './state/dialog.actions';
import { Observable } from 'rxjs';
import { NewDialogComponent } from './components/dialog.component';
import { map } from 'rxjs/operators';
import { DialogService } from './dialog.service';
import { dialogMatConfiguration } from './dialog.constants';

@Injectable()
export class DialogEffects {

    constructor(private actions$: Actions<DialogAction>,
        private dialogService: DialogService) {
    }

    @Effect({ dispatch: false })
    dialogOpen$: Observable<void> = this.actions$.pipe(
        ofType(DialogActionTypes.DialogOpenMTA),
        map((action) => {
            const matConfig = dialogMatConfiguration;
            matConfig.disableClose = action.payload.closable ? false : true
            this.dialogService.openDialog(NewDialogComponent, matConfig);
        })
    );
}
