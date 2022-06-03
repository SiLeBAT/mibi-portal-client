import { Credentials, TokenizedUser } from '../model/user.model';
import { createAction, props } from '@ngrx/store';
import { InstitutionDTO } from '../model/institution.model';

export const userLoginSSA = createAction(
    '[User] Login user',
    props<{ credentials: Credentials }>()
);

export const userLogoutMSA = createAction(
    '[User] Logout user'
);

export const userForceLogoutMSA = createAction(
    '[User] Force logout user'
);

export const userUpdateCurrentUserSOA = createAction(
    '[User] Store tokenized user',
    props<{ user: TokenizedUser }>()
);

export const userDestroyCurrentUserSOA = createAction(
    '[User] Delete current user'
);

export const userUpdateInstitutionsSOA = createAction(
    '[User] Populate institutions',
    props<{ institutions: InstitutionDTO[] }>()
);
