import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { OrdersMainSlice } from '../../../orders/orders.state';
import { orderListLoadSamplesWithResultsSOA } from '../../../orders/state/order-list.actions';
import { selectOrderById } from '../../../orders/state/order-list.selectors';
import { SamplesGridViewModel } from '../../samples-grid/samples-grid.model';
import { buildResultsGridViewModel } from '../results-grid/results-grid.builder';
import { createResultsGridModel } from '../results-grid/results-grid.constants';
import {
    PathogenTab,
    derivePathogenTabs,
    filterSamplesByPathogen,
    getResultColumnKeys
} from '../results-grid/pathogen-catalog';

@Component({
    standalone: false,
    selector: 'mibi-order-results-container',
    template: `
        <mibi-order-results-view
            [order]="order$ | async"
            [model]="gridModel$ | async"
            [pathogens]="pathogens$ | async"
            [selectedPathogenId]="selectedPathogenId$ | async"
            (selectPathogen)="onSelectPathogen($event)"
        ></mibi-order-results-view>
    `
})
export class OrderResultsContainerComponent {
    readonly order$: Observable<OrderEntryDTO | undefined>;
    readonly pathogens$: Observable<PathogenTab[]>;
    readonly selectedPathogenId$: Observable<string | null>;
    readonly gridModel$: Observable<SamplesGridViewModel>;

    private readonly orderId: string;
    private readonly selectedPathogen$ = new BehaviorSubject<string | null>(null);

    constructor(
        private readonly store$: Store<OrdersMainSlice>,
        route: ActivatedRoute
    ) {
        this.orderId = route.snapshot.paramMap.get('orderId') ?? '';
        // Ensure samples + results are loaded (the effect guards against re-fetching);
        // this also makes the view work on a direct deep-link / page refresh.
        this.store$.dispatch(orderListLoadSamplesWithResultsSOA({ orderId: this.orderId }));
        this.order$ = this.store$.pipe(select(selectOrderById(this.orderId)));

        this.pathogens$ = this.order$.pipe(
            map(order => derivePathogenTabs(order?.samples ?? [])),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        // Effective selection: the user's chosen tab, or the first tab as default.
        this.selectedPathogenId$ = combineLatest([this.pathogens$, this.selectedPathogen$]).pipe(
            map(([tabs, selected]) =>
                tabs.some(tab => tab.id === selected) ? selected : (tabs[0]?.id ?? null)
            ),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.gridModel$ = combineLatest([this.order$, this.selectedPathogenId$]).pipe(
            map(([order, pathogenId]) => {
                const samples = order?.samples ?? [];
                const rows = pathogenId ? filterSamplesByPathogen(samples, pathogenId) : samples;
                const resultKeys = pathogenId ? getResultColumnKeys(pathogenId) : [];
                return buildResultsGridViewModel(createResultsGridModel(resultKeys), rows);
            })
        );
    }

    onSelectPathogen(pathogenId: string): void {
        this.selectedPathogen$.next(pathogenId);
    }
}
