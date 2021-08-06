import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { Sample, ChangedDataGridField } from './model/sample-management.model';
import { selectSampleData, selectImportedFileName } from './state/samples.selectors';
import { SamplesMainSlice } from './samples.state';
import { ShowActionBarSOA, UpdateActionBarTitleSOA } from '../core/state/core.actions';
import { UserActionType } from '../shared/model/user-action.model';
import { UpdateSampleDataEntrySOA } from './state/samples.actions';

@Component({
    template: `
        <mibi-samples-grid-view
            [samples] = "samples$ | async"
            (dataChange)="onDataChange($event)">
        </mibi-samples-grid-view>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesComponent implements OnDestroy {

    readonly samples$: Observable<Sample[]> = this.store$.pipe(select(selectSampleData));

    private fileNameSubscription: Subscription;

    constructor(private readonly store$: Store<SamplesMainSlice>) {
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
            tap(fileName => {
                this.store$.dispatch(new UpdateActionBarTitleSOA({ title: fileName }));
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        this.fileNameSubscription.unsubscribe();
    }

    onDataChange(e: ChangedDataGridField): void {
        this.store$.dispatch(new UpdateSampleDataEntrySOA(e));
    }
}
