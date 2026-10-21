import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, convertToParamMap, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { OrderEntryDTO } from '../../core/model/response.model';
import { samplesPaths } from '../../samples/samples.paths';
import { selectOrderList } from '../state/order-list.selectors';
import { NoOrderGuard } from './no-order-guard.service';

function routeWith(params: Record<string, string>): ActivatedRouteSnapshot {
    return { paramMap: convertToParamMap(params) } as ActivatedRouteSnapshot;
}

describe('NoOrderGuard', () => {
    let store: MockStore;
    let router: Router;
    let guard: NoOrderGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideMockStore({
                    selectors: [{ selector: selectOrderList, value: [{ id: 'order-1' } as OrderEntryDTO] }]
                })
            ]
        });
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        guard = TestBed.inject(NoOrderGuard);
        jest.spyOn(store, 'dispatch');
        jest.spyOn(router, 'navigate');
    });

    afterEach(() => {
        expect(router.navigate).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('accepts the route for a known order', async () => {
        await expect(guard.canActivate(routeWith({ orderId: 'order-1' }))).resolves.toBe(true);
    });

    it.each([
        ['an unknown order', { orderId: 'order-2' }],
        ['a missing order id', {}]
    ])('redirects to the upload page for %s', async (_description, params) => {
        const result = await guard.canActivate(routeWith(params));

        expect(result).toBeInstanceOf(UrlTree);
        expect(router.serializeUrl(result as UrlTree)).toBe(samplesPaths.upload);
    });
});
