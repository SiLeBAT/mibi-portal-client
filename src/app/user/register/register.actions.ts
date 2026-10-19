import { createAction, props } from '@ngrx/store';
import { RegistrationDetails } from '../model/user.model';

export const userRegisterSSA = createAction(
    '[User/Register] Register a new user',
    props<{ details: RegistrationDetails }>()
);
