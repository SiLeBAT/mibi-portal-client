import { Action } from '@ngrx/store';
import { BehaviorSubject, ReplaySubject, of } from 'rxjs';

// The effect calls these selector functions directly on the emitted state,
// so we stub the selector modules with fixed return values.
jest.mock('../state/samples.selectors', () => ({
    selectImportedFileName: () => 'myfile.xlsx',
    selectSampleData: () => [],
    selectMetaData: () => ({}),
    selectSamplesMainData: () => ({}),
    selectHasErrors: () => false,
    selectHasAutoCorrections: () => false,
    selectHasWarnings: () => false
}));
jest.mock('./state/send-samples.selectors', () => ({
    selectSendSamplesIsFileAlreadySent: () => false
}));

import { samplesDestroyMainDataSOA } from '../state/samples.actions';
import { SendSamplesEffects } from './send-samples.effects';
import { sendSamplesConfirmSendSSA } from './state/send-samples.actions';

describe('SendSamplesEffects', () => {
    it('clears the sent samples from the store on a successful send', done => {
        const actions$ = new ReplaySubject<Action>(1);
        // store$ must be subscribable (for withLatestFrom(this.store$)) AND expose
        // .select(...) because the class builds several effects at construction time.
        const store$ = new BehaviorSubject<unknown>({});
        (store$ as unknown as { select: () => unknown }).select = () => of([]);
        const dataService = { sendSampleSheet: jest.fn(() => of([])) };
        const logger = { error: jest.fn(), warn: jest.fn() };
        const dialogService = { openDialog: jest.fn() };
        const samplesLinks = { upload: '/samples/upload' };
        const authService = { login: jest.fn() };

        const effects = new SendSamplesEffects(
            actions$ as never,
            store$ as never,
            dataService as never,
            logger as never,
            dialogService as never,
            samplesLinks as never,
            authService as never,
            false
        );

        const emitted: Action[] = [];
        effects.sendSamplesConfirmSend$.subscribe({
            next: action => emitted.push(action),
            complete: () => {
                const types = emitted.map(a => a.type);
                expect(types).toContain(samplesDestroyMainDataSOA.type);
                done();
            }
        });

        actions$.next(sendSamplesConfirmSendSSA({ comment: '' }));
        actions$.complete();
    });
});
