import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { samplesPaths } from '../samples.paths';
import { selectHasEntries } from '../state/samples.selectors';
import { NoSampleGuard } from './no-sample-guard.service';

describe('NoSampleGuard', () => {
    let store: MockStore;
    let router: Router;
    let guard: NoSampleGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideMockStore({ selectors: [{ selector: selectHasEntries, value: false }] })
            ]
        });
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router);
        guard = TestBed.inject(NoSampleGuard);
        jest.spyOn(store, 'dispatch');
        jest.spyOn(router, 'navigate');
    });

    it('accepts the route when there are samples', async () => {
        store.overrideSelector(selectHasEntries, true);
        store.refreshState();

        await expect(guard.canActivate()).resolves.toBe(true);
    });

    it('redirects to the upload page without side effects when there are no samples', async () => {
        const result = await guard.canActivate();

        expect(result).toBeInstanceOf(UrlTree);
        expect(router.serializeUrl(result as UrlTree)).toBe(samplesPaths.upload);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(store.dispatch).not.toHaveBeenCalled();
    });
});
