import { createAction, props } from '@ngrx/store';

export const navigateMSA = createAction(
    '[Shared/Navigate] Navigate to path',
    props<{ path: string }>()
);
