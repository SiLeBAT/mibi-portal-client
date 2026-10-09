import { Action } from '@ngrx/store';
import { ReplaySubject, firstValueFrom, of } from 'rxjs';
import { take, toArray } from 'rxjs/operators';
import { actionBarFileSelectedMSA, actionBarItemClickedMSA } from '../main/state/action-bar.actions';
import { SamplesActionBarEffects } from './samples-action-bar.effects';
import { samplesActionBarItemIds } from './samples-action-bar.items';

/** A store stub whose selectors all return the given values in order of use. */
const storeStub = (values: unknown[]) => {
    let next = 0;
    return {
        select: () => of(values[next++ % values.length])
    } as never;
};

const effectsFor = (actions$: ReplaySubject<Action>, selectorValues: unknown[]) =>
    new SamplesActionBarEffects(actions$ as never, storeStub(selectorValues));

describe('SamplesActionBarEffects', () => {

    describe('runUsedItem$', () => {
        // Each of the samples items must reach exactly the action that used to
        // sit behind its callback.
        const cases: [string, string][] = [
            [samplesActionBarItemIds.validate, '[Samples/ValidateSamples] Validate samples'],
            [samplesActionBarItemIds.export, '[Samples/ExportSamples] Export samples as Excel file'],
            [samplesActionBarItemIds.send, '[Samples/SendSamples] Send samples'],
            [samplesActionBarItemIds.close, '[Samples/CloseSamples] Close samples page']
        ];

        it.each(cases)('turns %s into an action', async id => {
            const actions$ = new ReplaySubject<Action>(1);
            const effects = effectsFor(actions$, [[]]);

            actions$.next(actionBarItemClickedMSA({ id: id }));

            const dispatched = await firstValueFrom(effects.runUsedItem$);
            expect(dispatched).toBeDefined();
        });

        it('dispatches the matching action type for each item', async () => {
            const actions$ = new ReplaySubject<Action>(4);
            const effects = effectsFor(actions$, [[]]);
            const seen = firstValueFrom(effects.runUsedItem$.pipe(take(4), toArray()));

            cases.forEach(([id]) => actions$.next(actionBarItemClickedMSA({ id: id })));

            const dispatched = await seen;
            expect(dispatched.map(action => action.type))
                .toEqual(cases.map(([, type]) => type));
        });

        // An id belonging to another feature must be left for that feature.
        it('ignores an id it does not own', async () => {
            const actions$ = new ReplaySubject<Action>(2);
            const effects = effectsFor(actions$, [[]]);
            const seen = firstValueFrom(effects.runUsedItem$.pipe(take(1), toArray()));

            actions$.next(actionBarItemClickedMSA({ id: 'core/downloadZomoPlanFile' }));
            actions$.next(actionBarItemClickedMSA({ id: samplesActionBarItemIds.validate }));

            const dispatched = await seen;
            expect(dispatched.map(action => action.type))
                .toEqual(['[Samples/ValidateSamples] Validate samples']);
        });
    });

    describe('importSelectedFile$', () => {
        it('imports the file chosen on the upload item', async () => {
            const actions$ = new ReplaySubject<Action>(1);
            const effects = effectsFor(actions$, [[]]);
            const file = new File(['x'], 'sheet.xlsx');

            actions$.next(actionBarFileSelectedMSA({
                id: samplesActionBarItemIds.upload,
                file: file
            }));

            const dispatched = await firstValueFrom(effects.importSelectedFile$) as
                Action & { excelFile: { file: File } };
            expect(dispatched.type).toBe('[Samples/ImportSamples] Import samples from Excel file');
            expect(dispatched.excelFile.file).toBe(file);
        });

        it('ignores a file chosen on another feature\'s item', async () => {
            const actions$ = new ReplaySubject<Action>(2);
            const effects = effectsFor(actions$, [[]]);
            const mine = new File(['x'], 'mine.xlsx');

            actions$.next(actionBarFileSelectedMSA({
                id: 'other/upload',
                file: new File(['y'], 'other.xlsx')
            }));
            actions$.next(actionBarFileSelectedMSA({
                id: samplesActionBarItemIds.upload,
                file: mine
            }));

            const dispatched = await firstValueFrom(effects.importSelectedFile$) as
                Action & { excelFile: { file: File } };
            expect(dispatched.excelFile.file).toBe(mine);
        });
    });
});
