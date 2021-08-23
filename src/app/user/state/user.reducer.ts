import { userDestroyCurrentUserSOA, userUpdateCurrentUserSOA, userUpdateInstitutionsSOA } from './user.actions';
import { TokenizedUser } from '../model/user.model';
import { InstitutionDTO } from '../model/institution.model';
import * as _ from 'lodash';
import { createReducer, on } from '@ngrx/store';

// STATE

export interface UserMainState {
    currentUser: TokenizedUser | null;
    institutes: InstitutionDTO[];
}

// REDUCER

export const userCurrentUserReducer = createReducer(
    null,
    on(userUpdateCurrentUserSOA, (state, action) => action.user),
    on(userDestroyCurrentUserSOA, state => null)
);

export const userInstitutesReducer = createReducer(
    [],
    on(userUpdateInstitutionsSOA, (state, action) => action.institutions)
);
