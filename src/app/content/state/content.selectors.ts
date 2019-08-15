import { createSelector } from '@ngrx/store';
import { selectContentSlice } from '../content.state';
import { ContentMainState } from './content.reducer';

export const selectContentMainState = selectContentSlice<ContentMainState>();

export const selectMasterData = createSelector(selectContentMainState, state => state.masterData);

export const selectSupportContact = createSelector(selectMasterData, state => state.supportContact);
