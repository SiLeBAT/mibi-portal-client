import { createSelector } from '@ngrx/store';
import { NrlState } from './nrl.reducer';
import { selectSharedSlice } from '../../shared.state';

export const selectNrlState = selectSharedSlice<NrlState>();

export const selectNrls = createSelector(selectNrlState, state => state.nrls);
