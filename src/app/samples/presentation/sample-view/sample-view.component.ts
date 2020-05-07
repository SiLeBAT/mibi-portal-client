import { Component, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UserActionType } from '../../../shared/model/user-action.model';
import { CoreMainSlice } from '../../../core/core.state';
import { Subscription } from 'rxjs';
import { ShowActionBarSOA, UpdateActionBarTitleSOA } from '../../../core/state/core.actions';
import { tap } from 'rxjs/operators';
import { selectImportedFileName } from '../../state/samples.selectors';
import { SamplesMainSlice } from '../../samples.state';
@Component({
    selector: 'mibi-sample-view',
    templateUrl: './sample-view.component.html'
})
export class SampleViewComponent implements OnDestroy {

    private fileNameSubscription: Subscription;

    constructor(
        private store$: Store<CoreMainSlice & SamplesMainSlice>) {
        this.store$.dispatch(new ShowActionBarSOA({
            title: '',
            enabledActions: [
                UserActionType.SEND,
                UserActionType.VALIDATE,
                UserActionType.EXPORT,
                UserActionType.CLOSE,
                UserActionType.UPLOAD,
                UserActionType.DOWNLOAD_TEMPLATE
            ]
        }));

        this.fileNameSubscription = this.store$.pipe(
            select(selectImportedFileName),
            tap(fileName => this.store$.dispatch(new UpdateActionBarTitleSOA({ title: fileName })))
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.fileNameSubscription.unsubscribe();
    }
}
