import { userDestroyCurrentUserSOA, userUpdateCurrentUserSOA, userUpdateInstitutionsSOA } from './user.actions';
import { TokenizedUser } from '../model/user.model';
import { InstitutionDTO } from '../model/institution.model';
import { createReducer, on } from '@ngrx/store';

// STATE

export interface UserMainState {
    currentUser: TokenizedUser | null;
    institutes: InstitutionDTO[];
}

// REDUCER

export const userCurrentUserReducer = createReducer<TokenizedUser | null>(
    null,
    on(userUpdateCurrentUserSOA, (_state, action) => action.user),
    on(userDestroyCurrentUserSOA, _state => null)
);

export const userInstitutesReducer = createReducer<InstitutionDTO[]>(
    [],
    on(userUpdateInstitutionsSOA, (_state, action) => action.institutions)
);
