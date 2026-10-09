import { ActionBarItem } from '../main/action-bar/action-bar.model';
import { closeSamplesConfirmDialogStrings } from './close-samples/close-samples.constants';
import {
    samplesActionBarItemIds,
    samplesEditorActionBarItems,
    samplesUploadActionBarItems
} from './samples-action-bar.items';

const idsOf = (hasEntries: boolean, isLoggedIn: boolean) =>
    samplesEditorActionBarItems(hasEntries, isLoggedIn).map(item => item.id);

describe('samples action bar items', () => {

    it('offers only the entry points on the upload page', () => {
        expect(samplesUploadActionBarItems(false).map(item => item.id)).toEqual([
            samplesActionBarItemIds.upload,
            samplesActionBarItemIds.downloadTemplate
        ]);
    });

    it('lets a file be chosen for the upload item', () => {
        const upload = samplesUploadActionBarItems(false).find(
            item => item.id === samplesActionBarItemIds.upload
        );
        expect(upload?.kind).toBe('upload');
    });

    describe('editor page', () => {
        // These four act on loaded samples, so an empty editor must not offer
        // them -- the behaviour the old container expressed by filtering.
        it('withholds the sample actions while nothing is loaded', () => {
            const ids = idsOf(false, true);

            expect(ids).not.toContain(samplesActionBarItemIds.send);
            expect(ids).not.toContain(samplesActionBarItemIds.validate);
            expect(ids).not.toContain(samplesActionBarItemIds.export);
            expect(ids).not.toContain(samplesActionBarItemIds.close);
        });

        it('still offers the entry points while nothing is loaded', () => {
            expect(idsOf(false, true)).toEqual([
                samplesActionBarItemIds.upload,
                samplesActionBarItemIds.downloadTemplate
            ]);
        });

        it('offers the sample actions once entries are loaded', () => {
            const ids = idsOf(true, true);

            expect(ids).toContain(samplesActionBarItemIds.send);
            expect(ids).toContain(samplesActionBarItemIds.validate);
            expect(ids).toContain(samplesActionBarItemIds.export);
            expect(ids).toContain(samplesActionBarItemIds.close);
        });

        // Sending needs an account; the rest do not.
        it('withholds only sending from an anonymous user', () => {
            const ids = idsOf(true, false);

            expect(ids).not.toContain(samplesActionBarItemIds.send);
            expect(ids).toContain(samplesActionBarItemIds.validate);
            expect(ids).toContain(samplesActionBarItemIds.export);
            expect(ids).toContain(samplesActionBarItemIds.close);
        });

        it('gives every item a distinct id', () => {
            const ids = idsOf(true, true);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });
});

describe('upload confirmation', () => {

    const uploadItemOf = (items: ActionBarItem[]) =>
        items.find(item => item.id === samplesActionBarItemIds.upload);

    // Uploading replaces what is loaded, so the warning must be offered
    // exactly when there is something to lose.
    it('asks for confirmation on the upload page when samples are loaded', () => {
        const upload = uploadItemOf(samplesUploadActionBarItems(true));
        expect(upload?.kind === 'upload' && upload.confirmMessage)
            .toBe(closeSamplesConfirmDialogStrings.message);
    });

    it('asks for nothing on the upload page when nothing is loaded', () => {
        const upload = uploadItemOf(samplesUploadActionBarItems(false));
        expect(upload?.kind === 'upload' && upload.confirmMessage).toBeUndefined();
    });

    it('asks for confirmation in the editor when samples are loaded', () => {
        const upload = uploadItemOf(samplesEditorActionBarItems(true, true));
        expect(upload?.kind === 'upload' && upload.confirmMessage)
            .toBe(closeSamplesConfirmDialogStrings.message);
    });

    it('asks for nothing in the editor when nothing is loaded', () => {
        const upload = uploadItemOf(samplesEditorActionBarItems(false, true));
        expect(upload?.kind === 'upload' && upload.confirmMessage).toBeUndefined();
    });
});
