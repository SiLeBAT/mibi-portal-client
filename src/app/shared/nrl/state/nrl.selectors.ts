import { createSelector } from '@ngrx/store';
import { NRLState } from './nrl.reducer';
import { selectSharedSlice } from '../../shared.state';

export const selectNRLMainState = selectSharedSlice<NRLState>();

export const selectNRLs = createSelector(selectNRLMainState, state => state.nrls);
