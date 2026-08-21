// `select(...)` becomes an identity operator so the store stub can emit the
// banner state directly instead of a full app state shaped for the selector.
jest.mock('@ngrx/store', () => ({
    ...jest.requireActual('@ngrx/store'),
    select: () => (source: unknown) => source
}));

import { BehaviorSubject } from 'rxjs';
import { AlertType, Banner } from '../../model/alert.model';
import { BannerContainerComponent } from './banner-container.component';
import { BannerData } from '../../state/core.reducer';

const bannerFor = (predefined: BannerData['predefined']): BannerData =>
    ({ show: true, predefined: predefined } as BannerData);

const bannerOf = async (bannerData: BannerData): Promise<Banner | null> => {
    const store$ = new BehaviorSubject<BannerData>(bannerData);

    const component = new BannerContainerComponent(
        store$ as never,
        { getConfigOfType: () => ({}), getNavigationConfig: () => ({}) } as never,
        { login: '', recovery: '', register: '' } as never,
        { bypassSecurityTrustHtml: (value: string) => value } as never
    );

    return new Promise<Banner | null>(resolve =>
        component.banner$.subscribe(value => resolve(value))
    );
};

describe('BannerContainerComponent', () => {
    it('tells the sender nothing was sent when the BfR was not reached', async () => {
        const banner = await bannerOf(bannerFor('sendFailure'));

        expect(banner?.message).toContain('Es wurde keine E-Mail ans BfR gesendet.');
        // The support line is appended by the send effects, which is the only
        // place that knows the number the server sent back.
        expect(banner?.message).not.toContain('telefonisch');
        expect(banner?.type).toBe(AlertType.ERROR);
    });

    describe('when only the sender\'s copy was lost', () => {
        it('tells them to print the uploaded file instead', async () => {
            const banner = await bannerOf(bannerFor('sendSuccessNoCustomerCopy'));

            expect(banner?.message).toContain('Ihre Daten wurden ans BfR gesandt.');
            expect(banner?.message).toContain('Excel-Datei als Probenbegleitschein');
        });

        it('is a warning, not an error - the data did arrive', async () => {
            const banner = await bannerOf(bannerFor('sendSuccessNoCustomerCopy'));

            expect(banner?.type).toBe(AlertType.WARNING);
        });
    });
});
