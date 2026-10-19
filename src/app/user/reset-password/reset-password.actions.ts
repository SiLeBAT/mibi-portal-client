import { createAction, props } from '@ngrx/store';

export const userResetPasswordSSA = createAction(
    '[User/ResetPassword] Set a new password',
    props<{ password: string; token: string }>()
);
