import { OrderListFilter, emptyOrderListFilter } from '../model/order-list-filter.model';
import { OrderListFilterStorageService } from './order-list-filter-storage.service';

const STORAGE_KEY = 'orderListFilter';

const completeFilter = (): OrderListFilter => ({
    ...emptyOrderListFilter(),
    results: 'complete'
});

describe('OrderListFilterStorageService', () => {
    let service: OrderListFilterStorageService;

    beforeEach(() => {
        sessionStorage.clear();
        service = new OrderListFilterStorageService();
    });

    it('returns an empty filter when the session holds none', () => {
        expect(service.load()).toEqual(emptyOrderListFilter());
    });

    it('keeps a saved filter for the rest of the session', () => {
        const filter = completeFilter();
        service.save(filter);

        // A new instance stands for the freshly created component/service after
        // the user navigated away and came back.
        expect(new OrderListFilterStorageService().load()).toEqual(filter);
    });

    it('keeps column search terms', () => {
        const filter = emptyOrderListFilter();
        filter.columns.fileName = 'probe.xlsx';
        service.save(filter);

        expect(service.load().columns.fileName).toBe('probe.xlsx');
    });

    it('removes the stored filter when it is cleared by the user', () => {
        service.save(completeFilter());
        service.save(emptyOrderListFilter());

        expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
        expect(service.load()).toEqual(emptyOrderListFilter());
    });

    it('drops the filter on clear (e.g. logout)', () => {
        service.save(completeFilter());
        service.clear();

        expect(service.load()).toEqual(emptyOrderListFilter());
    });

    it('falls back to an empty filter for unreadable stored data', () => {
        sessionStorage.setItem(STORAGE_KEY, 'not json');
        expect(service.load()).toEqual(emptyOrderListFilter());
    });

    it('ignores unknown columns and invalid results values', () => {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ columns: { fileName: 'a', bogus: 'b' }, results: 'nonsense' })
        );

        const loaded = service.load();
        expect(loaded.columns.fileName).toBe('a');
        expect(loaded.results).toBe('');
        expect((loaded.columns as Record<string, string>).bogus).toBeUndefined();
    });
});
