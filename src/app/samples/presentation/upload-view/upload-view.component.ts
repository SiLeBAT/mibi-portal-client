import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { takeWhile } from 'rxjs/operators';
import { SamplesMainSlice } from '../../samples.state';
import { importSamplesMSA } from '../../import-samples/import-samples.actions';
import { selectHasEntries } from '../../state/samples.selectors';
import { showDialogMSA } from '../../../core/state/core.actions';
import { UserActionType } from '../../../shared/model/user-action.model';
import { closeSamplesConfirmDialogStrings } from '../../close-samples/close-samples.constants';

@Component({
    standalone: false,
    selector: 'mibi-upload-view',
    templateUrl: './upload-view.component.html',
    styleUrls: ['./upload-view.component.scss']
})
export class UploadViewComponent implements OnInit, OnDestroy {

    private hasEntries = false;
    private componentActive = true;

    constructor(private store$: Store<SamplesMainSlice>) {}

    ngOnInit() {
        this.store$.pipe(
            select(selectHasEntries),
            takeWhile(() => this.componentActive)
        ).subscribe(entries => this.hasEntries = entries);
    }

    ngOnDestroy() {
        this.componentActive = false;
    }

    fileUpload(file: File) {
        if (this.hasEntries) {
            const strings = closeSamplesConfirmDialogStrings;
            this.store$.dispatch(showDialogMSA({ content: {
                title: strings.title,
                message: strings.message,
                mainAction: {
                    type: UserActionType.CUSTOM,
                    label: strings.confirmButtonLabel,
                    onExecute: () => {
                        this.store$.dispatch(importSamplesMSA({ excelFile: { file: file } }));
                    },
                    icon: '',
                    focused: true
                },
                auxilliaryAction: {
                    type: UserActionType.CUSTOM,
                    label: strings.cancelButtonLabel,
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    onExecute: () => {},
                    icon: ''
                }
            }}));
        } else {
            this.store$.dispatch(importSamplesMSA({ excelFile: { file: file } }));
        }
    }
}
