import { of } from 'rxjs';
import { OrderListFilter, emptyOrderListFilter } from '../../model/order-list-filter.model';
import { OrderListContainerComponent } from './order-list-container.component';

const storeStub = () => ({
    pipe: () => of([]),
    dispatch: jest.fn()
});

const filterFor = (results: OrderListFilter['results']): OrderListFilter => ({
    ...emptyOrderListFilter(),
    results: results
});

describe('OrderListContainerComponent', () => {
    it('starts with the filter stored for the current browser session', () => {
        const stored = filterFor('complete');
        const filterStorage = { load: jest.fn(() => stored), save: jest.fn() };

        const component = new OrderListContainerComponent(
            storeStub() as never,
            filterStorage as never
        );

        expect(component.filter).toBe(stored);
    });

    it('stores every filter change so it survives leaving the list', () => {
        const filterStorage = {
            load: jest.fn(() => emptyOrderListFilter()),
            save: jest.fn()
        };
        const component = new OrderListContainerComponent(
            storeStub() as never,
            filterStorage as never
        );

        const changed = filterFor('partial');
        component.onFilterChange(changed);

        expect(component.filter).toBe(changed);
        expect(filterStorage.save).toHaveBeenCalledWith(changed);
    });
});
