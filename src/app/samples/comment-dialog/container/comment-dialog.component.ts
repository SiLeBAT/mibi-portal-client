import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { DisplayBanner } from '../../../core/state/core.actions';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CommentDialogConfiguration } from '../model/comment-dialog-config.model';
import { FormControl } from '@angular/forms';
import { CommentDialogConfirm, CommentDialogActionTypes, CommentDialogCancel } from '../store/comment-dialog.actions';
import { SamplesSlice } from '../../samples.state';
import { CommentDialogStates } from '../store/comment-dialog.state';
import { selectCommentDialogConfiguration } from '../store/comment-dialog.selectors';
import { Observable, Subscription } from 'rxjs';
import { withLatestFrom, map, tap, takeWhile } from 'rxjs/operators';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';

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
        private store$: Store<SamplesSlice<CommentDialogStates>>) { }

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
