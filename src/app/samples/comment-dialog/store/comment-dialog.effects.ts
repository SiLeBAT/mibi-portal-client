import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CommentDialogAction, CommentDialogActionTypes } from './comment-dialog.actions';
import { Store } from '@ngrx/store';
import { SamplesSlice } from '../../samples.state';
import { CommentDialogStates } from './comment-dialog.state';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { CommentDialogComponent } from '../container/comment-dialog.component';
import { selectCommentDialogConfiguration } from './comment-dialog.selectors';
import { DialogService } from '../../../core/dialog/services/dialog.service';

@Injectable()
export class CommentDialogEffects {

    constructor(private actions$: Actions<CommentDialogAction>,
        private dialogService: DialogService,
        private store$: Store<SamplesSlice<CommentDialogStates>>) { }

    @Effect({ dispatch: false })
    open$: Observable<void> = this.actions$.pipe(
        ofType(CommentDialogActionTypes.CommentDialogOpen),
        map(() => this.dialogService.openDialog(CommentDialogComponent))
    );
}
