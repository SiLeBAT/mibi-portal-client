import { OrderEntryDTO, SampleWithResultsDTO } from '../../core/model/response.model';
import {
    orderListAddSamplesWithResultsSOA,
    orderListDestroySOA,
    orderListUpdateSOA
} from './order-list.actions';
import { orderListReducer } from './order-list.reducer';

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
    it('replaces the state with the populated order list', () => {
        const orders = [order('a'), order('b')];
        const state = orderListReducer([], orderListUpdateSOA({ orders: orders }));
        expect(state).toEqual(orders);
    });

    it('clears the order list on destroy', () => {
        const state = orderListReducer(
            [order('a')],
            orderListDestroySOA()
        );
        expect(state).toEqual([]);
    });

    it('attaches samples to the matching order and leaves others untouched', () => {
        const initial = [order('a'), order('b')];
        const payload = samples('a');

        const state = orderListReducer(
            initial,
            orderListAddSamplesWithResultsSOA({ orderId: 'a', samples: payload })
        );

        expect(state.find(o => o.id === 'a')?.samples).toBe(payload);
        expect(state.find(o => o.id === 'b')?.samples).toBeUndefined();
    });

    it('does not mutate the previous state', () => {
        const initial = [order('a')];
        const state = orderListReducer(
            initial,
            orderListAddSamplesWithResultsSOA({
                orderId: 'a',
                samples: samples('a')
            })
        );
        expect(state).not.toBe(initial);
        expect(initial[0].samples).toBeUndefined();
    });
});
