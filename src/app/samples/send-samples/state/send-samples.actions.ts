import { createAction, props } from '@ngrx/store';
import { DialogWarning } from '../../../shared/dialog/dialog.model';

export const sendSamplesSSA = createAction(
    '[Samples/SendSamples] Send samples'
);

// Analysis dialog

export const sendSamplesCancelAnalysisSSA = createAction(
    '[Samples/SendSamples] Cancel analysis dialog'
);

export const sendSamplesConfirmAnalysisSSA = createAction(
    '[Samples/SendSamples] Confirm analysis dialog'
);

// Send dialog

export const sendSamplesCancelSendSSA = createAction(
    '[Samples/SendSamples] Cancel send dialog'
);

export const sendSamplesConfirmSendSSA = createAction(
    '[Samples/SendSamples] Confirm send dialog',
    props<{ comment: string }>()
);

// State

export const sendSamplesAddSentFileSOA = createAction(
    '[Samples/SendSamples] Add name of sent file to sent files',
    props<{ sentFile: string }>()
);

export const sendSamplesUpdateDialogWarningsSOA = createAction(
    '[Samples/SendSamples] Update warnings displayed in dialogs',
    props<{ warnings: DialogWarning[] }>()
);
