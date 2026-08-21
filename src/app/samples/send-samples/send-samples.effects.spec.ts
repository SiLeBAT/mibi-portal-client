import { Action } from '@ngrx/store';
import { BehaviorSubject, ReplaySubject, of, throwError } from 'rxjs';

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

import { EndpointError } from '../../core/model/client-error';
import { showBannerSOA, showCustomBannerSOA } from '../../core/state/core.actions';
import { samplesDestroyMainDataSOA } from '../state/samples.actions';
import { SendSamplesEffects } from './send-samples.effects';
import { sendSamplesConfirmSendSSA } from './state/send-samples.actions';

type BannerAction = Action & { predefined?: string; banner?: { message: string } };

const runConfirmSend = async (
    sendSampleSheet: jest.Mock
): Promise<BannerAction[]> => new Promise(resolve => {
    const actions$ = new ReplaySubject<Action>(1);
    // store$ must be subscribable (for withLatestFrom(this.store$)) AND expose
    // .select(...) because the class builds several effects at construction time.
    const store$ = new BehaviorSubject<unknown>({});
    (store$ as unknown as { select: () => unknown }).select = () => of([]);

    const effects = new SendSamplesEffects(
        actions$ as never,
        store$ as never,
        { sendSampleSheet: sendSampleSheet } as never,
        { error: jest.fn(), warn: jest.fn() } as never,
        { openDialog: jest.fn() } as never,
        { upload: '/samples/upload' } as never,
        { login: jest.fn() } as never,
        { getConfigOfType: () => ({}) } as never,
        false
    );

    const emitted: BannerAction[] = [];
    effects.sendSamplesConfirmSend$.subscribe({
        next: action => emitted.push(action as BannerAction),
        complete: () => resolve(emitted)
    });

    actions$.next(sendSamplesConfirmSendSSA({ comment: '' }));
    actions$.complete();
});

const bannerOf = (emitted: BannerAction[]): string | undefined =>
    emitted.find(action => action.type === showBannerSOA.type)?.predefined;

describe('SendSamplesEffects', () => {
    it('clears the sent samples from the store on a successful send', async () => {
        const emitted = await runConfirmSend(
            jest.fn(() => of({ samples: [], customerCopySent: true }))
        );

        expect(emitted.map(a => a.type)).toContain(samplesDestroyMainDataSOA.type);
    });

    it('confirms the send when the sender also received their copy', async () => {
        const emitted = await runConfirmSend(
            jest.fn(() => of({ samples: [], customerCopySent: true }))
        );

        expect(bannerOf(emitted)).toBe('sendSuccess');
    });

    it('tells the sender to print the uploaded file when their copy was lost', async () => {
        const emitted = await runConfirmSend(
            jest.fn(() => of({ samples: [], customerCopySent: false }))
        );

        // The data did reach the BfR, so this is not the failure banner.
        expect(bannerOf(emitted)).toBe('sendSuccessNoCustomerCopy');
        // ...and the order still counts as sent.
        expect(emitted.map(a => a.type)).toContain(samplesDestroyMainDataSOA.type);
    });

    it('reports a failure when nothing reached the BfR', async () => {
        const emitted = await runConfirmSend(
            jest.fn(() => throwError(() => new Error('submission failed')))
        );

        expect(bannerOf(emitted)).toBe('sendFailure');
        expect(emitted.map(a => a.type)).not.toContain(samplesDestroyMainDataSOA.type);
    });

    it('tells the sender to ring the responsible person when mail delivery failed', async () => {
        const emitted = await runConfirmSend(
            jest.fn(() => throwError(() =>
                new EndpointError({ code: 10, supportPhone: '030 18412-0' }, 'failed')))
        );

        const custom = emitted.find(action => action.type === showCustomBannerSOA.type);
        expect(custom?.banner?.message).toBe(
            'Das Versenden von E-Mails ist zur Zeit gestört.'
            + ' Bitte rufen Sie die für das MiBi-Portal verantwortliche Person an: 030 18412-0'
        );
    });

    it('falls back to the plain failure banner when no number is configured', async () => {
        const emitted = await runConfirmSend(
            jest.fn(() => throwError(() => new EndpointError({ code: 10 }, 'failed')))
        );

        expect(bannerOf(emitted)).toBe('sendFailure');
    });

    it('does not blame mail for a failure that was not a mail failure', async () => {
        // Code 9 is ORDER_SAVING_FAILED - the database, not the mail system.
        const emitted = await runConfirmSend(
            jest.fn(() => throwError(() =>
                new EndpointError({ code: 9, supportPhone: '030 18412-0' }, 'failed')))
        );

        expect(bannerOf(emitted)).toBe('sendFailure');
        expect(emitted.find(a => a.type === showCustomBannerSOA.type)).toBeUndefined();
    });
});
