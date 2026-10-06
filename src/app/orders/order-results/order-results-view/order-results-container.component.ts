import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, scan, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { OrderEntryDTO } from '../../../core/model/response.model';
import { OrdersMainSlice } from '../../orders.state';
import { orderListLoadSamplesWithResultsSOA } from '../../state/order-list.actions';
import {
    OrderNeighbours,
    selectOrderById,
    selectOrderNeighbours
} from '../../state/order-list.selectors';
import { navigateMSA } from '../../../shared/navigate/navigate.actions';
import { orderResultsPath } from '../../orders.paths';
import { ResultsDownloadService } from '../download/results-download.service';
import { SamplesGridViewModel } from '../../../grid/samples-grid/samples-grid.model';
import { buildResultsGridViewModel } from '../results-grid/results-grid.builder';
import { createFullDataGridModel, createResultsGridModel, gridColumnTemplate } from '../results-grid/results-grid.constants';
import {
    NrlMatcher,
    NrlTab,
    createNrlMatcher,
    deriveNrlTabs,
    filterSamplesByNrl,
    getResultColumns
} from '../results-grid/nrl-results-catalog';
import { SharedSlice } from '../../../shared/shared.state';
import { NrlState } from '../../../shared/nrl/state/nrl.reducer';
import { selectNrls } from '../../../shared/nrl/state/nrl.selectors';

@Component({
    standalone: false,
    selector: 'mibi-order-results-container',
    template: `
        <mibi-order-results-view
            [order]="order$ | async"
            [model]="(grid$ | async)?.model"
            [columnTemplate]="(grid$ | async)?.columnTemplate"
            [nrlTabs]="nrlTabs$ | async"
            [selectedNrlId]="selectedNrlId$ | async"
            [showFullData]="showFullData$ | async"
            [neighbours]="neighbours$ | async"
            (selectNrl)="onSelectNrl($event)"
            (toggleFullData)="onToggleFullData()"
            (openOrder)="onOpenOrder($event)"
            (downloadDisplayed)="onDownloadDisplayed()"
            (downloadAll)="onDownloadAll()"
        ></mibi-order-results-view>
    `
})
export class OrderResultsContainerComponent implements OnDestroy {
    readonly order$: Observable<OrderEntryDTO | undefined>;
    readonly nrlTabs$: Observable<NrlTab[]>;
    readonly selectedNrlId$: Observable<string | null>;
    readonly grid$: Observable<{ model: SamplesGridViewModel; columnTemplate: string }>;
    readonly neighbours$: Observable<OrderNeighbours>;
    private readonly toggleFullData$ = new Subject<void>();
    readonly showFullData$: Observable<boolean> = this.toggleFullData$.pipe(
        scan(current => !current, false),
        startWith(false),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    private readonly orderId$: Observable<string>;
    private readonly selectedNrl$ = new BehaviorSubject<string | null>(null);
    private readonly nrlMatcher$: Observable<NrlMatcher>;
    private readonly loadSubscription: Subscription;

    constructor(
        private readonly store$: Store<OrdersMainSlice & SharedSlice<NrlState>>,
        private readonly download: ResultsDownloadService,
        route: ActivatedRoute
    ) {
        // The route is reused when switching to another order, so react to the
        // param stream rather than reading a one-off snapshot.
        this.orderId$ = route.paramMap.pipe(
            map(params => params.get('orderId') ?? ''),
            distinctUntilChanged(),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        // Ensure samples + results are loaded for whichever order is shown (the
        // effect guards against re-fetching); this also covers a direct deep-link
        // or page refresh. Switching orders always resets to the first tab.
        this.loadSubscription = this.orderId$.subscribe(orderId => {
            this.selectedNrl$.next(null);
            this.store$.dispatch(orderListLoadSamplesWithResultsSOA({ orderId: orderId }));
        });

        this.order$ = this.orderId$.pipe(
            switchMap(orderId => this.store$.pipe(select(selectOrderById(orderId))))
        );

        this.neighbours$ = this.orderId$.pipe(
            switchMap(orderId => this.store$.pipe(select(selectOrderNeighbours(orderId))))
        );

        // Samples are assigned to NRL tabs via the NRL regex selectors (ticket #875),
        // compiled once per NRL list.
        this.nrlMatcher$ = this.store$.pipe(
            select(selectNrls),
            map(nrls => createNrlMatcher(nrls)),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.nrlTabs$ = combineLatest([this.order$, this.nrlMatcher$]).pipe(
            map(([order, matcher]) => deriveNrlTabs(order?.samples ?? [], matcher)),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        // Effective selection: the user's chosen tab, or the first tab as default.
        this.selectedNrlId$ = combineLatest([this.nrlTabs$, this.selectedNrl$]).pipe(
            map(([tabs, selected]) =>
                tabs.some(tab => tab.id === selected) ? selected : (tabs[0]?.id ?? null)
            ),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.grid$ = combineLatest([this.order$, this.selectedNrlId$, this.showFullData$, this.nrlMatcher$]).pipe(
            map(([order, nrlId, showFullData, matcher]) => {
                const samples = order?.samples ?? [];
                const rows = nrlId ? filterSamplesByNrl(samples, nrlId, matcher) : samples;
                const resultsModel = showFullData
                    ? createFullDataGridModel()
                    : createResultsGridModel(nrlId ? getResultColumns(nrlId) : []);
                return {
                    model: buildResultsGridViewModel(resultsModel, rows),
                    columnTemplate: gridColumnTemplate(resultsModel)
                };
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    ngOnDestroy(): void {
        this.loadSubscription.unsubscribe();
    }

    onSelectNrl(nrlId: string): void {
        this.selectedNrl$.next(nrlId);
    }

    onToggleFullData(): void {
        this.toggleFullData$.next();
    }

    onOpenOrder(orderId: string): void {
        this.store$.dispatch(navigateMSA({ path: orderResultsPath(orderId) }));
    }

    onDownloadDisplayed(): void {
        combineLatest([this.order$, this.selectedNrlId$, this.nrlMatcher$]).pipe(take(1)).subscribe(
            ([order, nrlId, matcher]) => {
                if (order && nrlId) {
                    this.download.downloadDisplayed(order, nrlId, matcher);
                }
            }
        );
    }

    onDownloadAll(): void {
        combineLatest([this.order$, this.nrlMatcher$]).pipe(take(1)).subscribe(([order, matcher]) => {
            if (order) {
                this.download.downloadAll(order, matcher);
            }
        });
    }
}
