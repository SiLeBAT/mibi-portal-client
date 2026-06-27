import { Action } from '@ngrx/store';
import { BehaviorSubject, ReplaySubject, of, throwError } from 'rxjs';
import { showBannerSOA } from '../core/state/core.actions';
import { OrderListEffects } from './orders.effects';
import {
    orderListAddSamplesWithResultsSOA,
    orderListLoadSamplesWithResultsSOA
} from './state/order-list.actions';

type Orders = Array<{ id: string; samples?: unknown }>;

const buildEffects = (ordersInStore: Orders, dataService: unknown) => {
    const actions$ = new ReplaySubject<Action>(1);
    // store$ must be subscribable AND expose .select(); the effect uses
    // withLatestFrom(this.store$.select(selectOrderList)).
    const store$ = new BehaviorSubject<unknown>({});
    (store$ as unknown as { select: () => unknown }).select = () =>
        of(ordersInStore);
    const logger = { error: jest.fn() };

    const effects = new OrderListEffects(
        actions$ as never,
        store$ as never,
        dataService as never,
        logger as never
    );
    return { effects: effects, actions$: actions$, logger: logger };
};

describe('OrderListEffects.loadSamplesWithResults$', () => {
    it('fetches and emits an add action carrying the response orderId and samples', done => {
        const response = { orderId: 'o1', samples: [{ id: 's1' }] };
        const dataService = {
            getSamplesWithResults: jest.fn(() => of(response))
        };
        const { effects, actions$ } = buildEffects(
            [{ id: 'o1' }], // no samples loaded yet
            dataService
        );

        effects.loadSamplesWithResults$.subscribe({
            next: action => {
                expect(action).toEqual(
                    orderListAddSamplesWithResultsSOA({
                        orderId: 'o1',
                        samples: response.samples as never
                    })
                );
                expect(dataService.getSamplesWithResults).toHaveBeenCalledWith(
                    'o1'
                );
                done();
            }
        });

        actions$.next(orderListLoadSamplesWithResultsSOA({ orderId: 'o1' }));
    });

    it('skips the request when the order already has samples cached', done => {
        const dataService = {
            getSamplesWithResults: jest.fn(() => of({ orderId: 'o1', samples: [] }))
        };
        const { effects, actions$ } = buildEffects(
            [{ id: 'o1', samples: [{ id: 's1' }] }], // already cached
            dataService
        );

        const emitted: Action[] = [];
        effects.loadSamplesWithResults$.subscribe({
            next: a => emitted.push(a),
            complete: () => {
                expect(emitted).toEqual([]);
                expect(dataService.getSamplesWithResults).not.toHaveBeenCalled();
                done();
            }
        });

        actions$.next(orderListLoadSamplesWithResultsSOA({ orderId: 'o1' }));
        actions$.complete();
    });

    it('emits a banner action when the request fails', done => {
        const dataService = {
            getSamplesWithResults: jest.fn(() =>
                throwError(() => ({ stack: 'boom' }))
            )
        };
        const { effects, actions$, logger } = buildEffects(
            [{ id: 'o1' }],
            dataService
        );

        effects.loadSamplesWithResults$.subscribe({
            next: action => {
                expect(action.type).toBe(showBannerSOA.type);
                expect(logger.error).toHaveBeenCalled();
                done();
            }
        });

        actions$.next(orderListLoadSamplesWithResultsSOA({ orderId: 'o1' }));
    });
});
