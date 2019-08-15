import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { CommentDialogConfirmMTA, CommentDialogCancelMTA } from '../state/comment-dialog.actions';
import { CommentDialogState, CommentDialogData } from '../state/comment-dialog.reducer';
import { selectCommentDialogData } from '../state/comment-dialog.selectors';
import { Observable } from 'rxjs';
import { SharedSlice } from '../../shared.state';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'mibi-comment-dialog',
    templateUrl: './comment-dialog.component.html',
    styleUrls: ['./comment-dialog.component.scss']
})
export class CommentDialogComponent {
    data$: Observable<CommentDialogData> = this.store$.pipe(
        select(selectCommentDialogData),
        tap((data) => { this.caller = data.caller; })
    );

    private caller: string;

    commentControl = new FormControl('');

    constructor(
        private dialogRef: MatDialogRef<CommentDialogComponent>,
        private store$: Store<SharedSlice<CommentDialogState>>) { }

    onConfirm() {
        this.store$.dispatch(new CommentDialogConfirmMTA(this.caller, { comment: this.commentControl.value }));
        this.close();
    }

    onCancel() {
        this.store$.dispatch(new CommentDialogCancelMTA(this.caller));
        this.close();
    }

    private close(): void {
        this.dialogRef.close();
    }
}
