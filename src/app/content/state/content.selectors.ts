import { createSelector } from '@ngrx/store';
import { selectContentSlice } from '../content.state';
import { ContentMainStates } from './content.state';

export const selectContentMainStates = selectContentSlice<ContentMainStates>();

export const selectMasterDataState = createSelector(selectContentMainStates, state => state.masterData);

export const selectSupportContact = createSelector(selectMasterDataState, state => state.supportContact);
