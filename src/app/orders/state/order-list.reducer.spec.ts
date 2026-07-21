import { OrderEntryDTO, SampleWithResultsDTO } from '../../core/model/response.model';
import {
    orderListAddSamplesWithResultsSOA,
    orderListDestroySOA,
    orderListUpdateSOA,
    orderListUpdateSequenceSOA
} from './order-list.actions';
import { OrderListState, orderListReducer } from './order-list.reducer';

const order = (id: string): OrderEntryDTO => ({
    id: id,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    sampleCount: 0,
    version: '17',
    fileName: `${id}.xlsx`,
    nrls: [],
    pathogens: [],
    sampleIds: [],
    sampleIdsAVV: [],
    results: '0/0'
});

const state = (orders: OrderEntryDTO[], sequence: string[] = []): OrderListState => ({
    orders: orders,
    sequence: sequence
});

const samples = (id: string): SampleWithResultsDTO[] =>
    [
        {
            id: `sample-${id}`,
            position: 1,
            sampleData: {},
            sampleMeta: {},
            results: []
        }
    ] as unknown as SampleWithResultsDTO[];

describe('orderListReducer', () => {
    it('replaces the orders with the populated order list', () => {
        const orders = [order('a'), order('b')];
        const result = orderListReducer(state([]), orderListUpdateSOA({ orders: orders }));
        expect(result.orders).toEqual(orders);
    });

    it('invalidates a previously reported sequence when the list is refetched', () => {
        const result = orderListReducer(
            state([order('a')], ['a']),
            orderListUpdateSOA({ orders: [order('b')] })
        );
        expect(result.sequence).toEqual([]);
    });

    it('clears the order list on destroy', () => {
        const result = orderListReducer(state([order('a')], ['a']), orderListDestroySOA());
        expect(result.orders).toEqual([]);
        expect(result.sequence).toEqual([]);
    });

    it('stores the displayed order sequence', () => {
        const result = orderListReducer(
            state([order('a'), order('b')]),
            orderListUpdateSequenceSOA({ orderIds: ['b', 'a'] })
        );
        expect(result.sequence).toEqual(['b', 'a']);
        expect(result.orders.map(o => o.id)).toEqual(['a', 'b']);
    });

    it('attaches samples to the matching order and leaves others untouched', () => {
        const initial = state([order('a'), order('b')]);
        const payload = samples('a');

        const result = orderListReducer(
            initial,
            orderListAddSamplesWithResultsSOA({ orderId: 'a', samples: payload })
        );

        expect(result.orders.find(o => o.id === 'a')?.samples).toBe(payload);
        expect(result.orders.find(o => o.id === 'b')?.samples).toBeUndefined();
    });

    it('does not mutate the previous state', () => {
        const initial = state([order('a')]);
        const result = orderListReducer(
            initial,
            orderListAddSamplesWithResultsSOA({
                orderId: 'a',
                samples: samples('a')
            })
        );
        expect(result).not.toBe(initial);
        expect(initial.orders[0].samples).toBeUndefined();
    });
});
