import { createAction, props } from '@ngrx/store';

export const userRecoverPasswordSSA = createAction(
    '[User/RecoverPassword] Request a password reset mail',
    props<{ email: string }>()
);
