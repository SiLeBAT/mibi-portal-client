import { OrderEntryDTO } from '../../core/model/response.model';
import { OrderListState } from './order-list.reducer';
import {
    selectOrderById,
    selectOrderList,
    selectOrderNeighbours,
    selectOrderSequence
} from './order-list.selectors';

const order = (id: string): OrderEntryDTO => ({ id: id }) as OrderEntryDTO;

const state = (ids: string[], sequence: string[] = []): OrderListState => ({
    orders: ids.map(id => order(id)),
    sequence: sequence
});

describe('selectOrderList / selectOrderSequence', () => {
    it('expose the orders and the displayed sequence from the slice', () => {
        const slice = state(['a', 'b'], ['b', 'a']);
        expect(selectOrderList.projector(slice)).toBe(slice.orders);
        expect(selectOrderSequence.projector(slice)).toEqual(['b', 'a']);
    });
});

describe('selectOrderById', () => {
    it('finds the matching order or undefined', () => {
        const orders = [order('a'), order('b')];
        expect(selectOrderById('b').projector(orders)?.id).toBe('b');
        expect(selectOrderById('x').projector(orders)).toBeUndefined();
    });
});

describe('selectOrderNeighbours', () => {
    it('uses the stored array order when no sequence is reported', () => {
        const orders = [order('a'), order('b'), order('c')];
        expect(selectOrderNeighbours('a').projector(orders, [])).toEqual({ newerOrderId: null, olderOrderId: 'b' });
        expect(selectOrderNeighbours('b').projector(orders, [])).toEqual({ newerOrderId: 'a', olderOrderId: 'c' });
        expect(selectOrderNeighbours('c').projector(orders, [])).toEqual({ newerOrderId: 'b', olderOrderId: null });
    });

    it('follows the displayed sequence when one is reported', () => {
        const orders = [order('a'), order('b'), order('c')];
        expect(selectOrderNeighbours('a').projector(orders, ['c', 'a', 'b']))
            .toEqual({ newerOrderId: 'c', olderOrderId: 'b' });
    });

    it('returns no neighbours for an unknown order', () => {
        expect(selectOrderNeighbours('x').projector([order('a')], []))
            .toEqual({ newerOrderId: null, olderOrderId: null });
    });
});
