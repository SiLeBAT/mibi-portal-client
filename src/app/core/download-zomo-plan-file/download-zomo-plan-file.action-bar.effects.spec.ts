import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom, of } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { actionBarMenuEntrySelectedMSA } from '../../main/state/action-bar.actions';
import { ZomoPlanFileInfo } from '../model/response.model';
import { downloadZomoPlanFileActionBarItem, downloadZomoPlanFileItemId } from './download-zomo-plan-file.action-bar';
import { DownloadZomoPlanFileActionBarEffects } from './download-zomo-plan-file.action-bar.effects';

const files: ZomoPlanFileInfo[] = [
    { id: 'f-2025', year: '2025' },
    { id: 'f-2026', year: '2026' }
];

const effectsFor = (actions$: ReplaySubject<Action>, zomoPlanFiles: ZomoPlanFileInfo[]) =>
    new DownloadZomoPlanFileActionBarEffects(
        actions$ as never,
        { select: () => of(zomoPlanFiles) } as never
    );

describe('downloadZomoPlanFileActionBarItem', () => {

    it('offers one entry per file, labelled by year and keyed by file id', () => {
        expect(downloadZomoPlanFileActionBarItem(files)).toEqual({
            kind: 'menu',
            id: downloadZomoPlanFileItemId,
            label: 'ZoMo-Plan',
            icon: 'assignment_returned',
            entries: [
                { entryId: 'f-2025', label: 'ZoMo-Plan 2025' },
                { entryId: 'f-2026', label: 'ZoMo-Plan 2026' }
            ]
        });
    });

    it('offers no entries when no file is available', () => {
        const item = downloadZomoPlanFileActionBarItem([]);
        expect(item.kind === 'menu' && item.entries).toEqual([]);
    });
});

describe('DownloadZomoPlanFileActionBarEffects', () => {

    it('downloads the file the chosen entry identifies', async () => {
        const actions$ = new ReplaySubject<Action>(1);
        const effects = effectsFor(actions$, files);

        actions$.next(actionBarMenuEntrySelectedMSA({
            id: downloadZomoPlanFileItemId,
            entryId: 'f-2026'
        }));

        const dispatched = await firstValueFrom(effects.downloadChosenZomoPlanFile$) as
            Action & { zomoPlanFileInfo: ZomoPlanFileInfo };
        expect(dispatched.type).toBe('[Core/DownloadZomoPlanFile] Download Zomo-Plan file');
        expect(dispatched.zomoPlanFileInfo).toEqual(files[1]);
    });

    it('ignores a menu choice made on another feature\'s item', async () => {
        const actions$ = new ReplaySubject<Action>(2);
        const effects = effectsFor(actions$, files);
        const seen = firstValueFrom(effects.downloadChosenZomoPlanFile$.pipe(take(1), toArray()));

        actions$.next(actionBarMenuEntrySelectedMSA({ id: 'other/menu', entryId: 'f-2025' }));
        actions$.next(actionBarMenuEntrySelectedMSA({
            id: downloadZomoPlanFileItemId,
            entryId: 'f-2026'
        }));

        const dispatched = await seen;
        const downloaded = (dispatched as (Action & { zomoPlanFileInfo: ZomoPlanFileInfo })[])
            .map(action => action.zomoPlanFileInfo);
        expect(downloaded).toEqual([files[1]]);
    });

    // A stale menu could name a file the store no longer lists.
    it('downloads nothing when the chosen entry is not among the known files', async () => {
        const actions$ = new ReplaySubject<Action>(2);
        const effects = effectsFor(actions$, files);
        const seen = firstValueFrom(effects.downloadChosenZomoPlanFile$.pipe(take(1), toArray()));

        actions$.next(actionBarMenuEntrySelectedMSA({
            id: downloadZomoPlanFileItemId,
            entryId: 'f-gone'
        }));
        actions$.next(actionBarMenuEntrySelectedMSA({
            id: downloadZomoPlanFileItemId,
            entryId: 'f-2025'
        }));

        const dispatched = await seen;
        const downloaded = (dispatched as (Action & { zomoPlanFileInfo: ZomoPlanFileInfo })[])
            .map(action => action.zomoPlanFileInfo);
        expect(downloaded).toEqual([files[0]]);
    });
});
