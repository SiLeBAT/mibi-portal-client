import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { MatDialogRef } from '@angular/material';
import { CommentDialogConfiguration } from '../comment-dialog.model';
import { FormControl } from '@angular/forms';
import { CommentDialogConfirm, CommentDialogCancel } from '../state/comment-dialog.actions';
import { CommentDialogStates } from '../state/comment-dialog.state';
import { selectCommentDialogConfiguration } from '../state/comment-dialog.selectors';
import { Observable } from 'rxjs';
import { SharedSlice } from '../../shared.state';

@Component({
    selector: 'mibi-comment-dialog',
    templateUrl: './comment-dialog.component.html',
    styleUrls: ['./comment-dialog.component.scss']
})
export class CommentDialogComponent {
    config$: Observable<CommentDialogConfiguration> = this.store$.pipe(
        select(selectCommentDialogConfiguration)
    );

    commentControl = new FormControl('');

    constructor(
        private dialogRef: MatDialogRef<CommentDialogComponent>,
        private store$: Store<SharedSlice<CommentDialogStates>>) { }

    onConfirm() {
        this.store$.dispatch(new CommentDialogConfirm({ comment: this.commentControl.value }));
        this.close();
    }

    onCancel() {
        this.store$.dispatch(new CommentDialogCancel());
        this.close();
    }

    private close(): void {
        this.dialogRef.close();
    }
}
