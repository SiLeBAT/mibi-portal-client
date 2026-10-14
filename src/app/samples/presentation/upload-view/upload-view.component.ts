import { Component, OnDestroy, OnInit } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';
import { SamplesMainSlice } from '../../samples.state';
import { importSamplesMSA } from '../../import-samples/import-samples.actions';
import { selectHasEntries } from '../../state/samples.selectors';
import { DialogConfiguration } from '../../../shared/dialog/dialog.model';
import {
    dialogCancelMTA,
    dialogConfirmMTA,
    dialogOpenMTA
} from '../../../shared/dialog/state/dialog.actions';
import { ofTarget } from '../../../shared/ngrx/multi-target-action';
import { closeSamplesConfirmDialogStrings } from '../../close-samples/close-samples.constants';

@Component({
    standalone: false,
    selector: 'mibi-upload-view',
    templateUrl: './upload-view.component.html',
    styleUrls: ['./upload-view.component.scss']
})
export class UploadViewComponent implements OnInit, OnDestroy {

    private readonly CONFIRM_DIALOG_TARGET = 'Samples/UploadView/ReplaceConfirm';

    private hasEntries = false;
    private componentActive = true;

    /**
     * The file waiting for the user's answer. The dialog's confirm action
     * carries only the target it belongs to, and a File is not state the store
     * should hold, so the file stays here between opening the dialog and the
     * answer coming back.
     */
    private pendingFile: File | null = null;

    constructor(
        private store$: Store<SamplesMainSlice>,
        private actions$: Actions
    ) {}

    ngOnInit() {
        this.store$.pipe(
            select(selectHasEntries),
            takeWhile(() => this.componentActive)
        ).subscribe(entries => this.hasEntries = entries);

        this.actions$.pipe(
            ofType(dialogConfirmMTA),
            ofTarget(this.CONFIRM_DIALOG_TARGET),
            takeWhile(() => this.componentActive)
        ).subscribe(() => this.importPendingFile());

        this.actions$.pipe(
            ofType(dialogCancelMTA),
            ofTarget(this.CONFIRM_DIALOG_TARGET),
            takeWhile(() => this.componentActive)
        ).subscribe(() => this.pendingFile = null);
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    fileUpload(file: File) {
        // Replacing samples that are already loaded loses the user's changes,
        // so that case is confirmed first.
        if (!this.hasEntries) {
            this.importFile(file);
            return;
        }
        this.pendingFile = file;
        this.store$.dispatch(dialogOpenMTA({
            target: this.CONFIRM_DIALOG_TARGET,
            configuration: this.createConfirmDialogConfiguration()
        }));
    }

    private importPendingFile() {
        const file = this.pendingFile;
        this.pendingFile = null;
        if (file) {
            this.importFile(file);
        }
    }

    private importFile(file: File) {
        this.store$.dispatch(importSamplesMSA({ excelFile: { file: file } }));
    }

    private createConfirmDialogConfiguration(): DialogConfiguration {
        const strings = closeSamplesConfirmDialogStrings;
        return {
            title: strings.title,
            message: strings.message,
            confirmButtonConfig: {
                label: strings.confirmButtonLabel
            },
            cancelButtonConfig: {
                label: strings.cancelButtonLabel
            },
            warnings: []
        };
    }
}
