import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CommentDialogAction, CommentDialogActionTypes } from './state/comment-dialog.actions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommentDialogComponent } from './components/comment-dialog.component';
import { DialogService } from '../dialog/dialog.service';

@Injectable()
export class CommentDialogEffects {

    constructor(private actions$: Actions<CommentDialogAction>,
        private dialogService: DialogService) { }

    @Effect({ dispatch: false })
    commentDialogOpen$: Observable<void> = this.actions$.pipe(
        ofType(CommentDialogActionTypes.CommentDialogOpenMTA),
        map(() => this.dialogService.openDialog(CommentDialogComponent))
    );
}
