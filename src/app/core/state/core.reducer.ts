
import * as fromRoot from '../../state/app.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SystemActions, CoreActionTypes } from './core.actions';
import { SamplesActionTypes } from '../../samples/state/samples.actions';
import { IAlert } from '../model/alert.model';
import { UserActionTypes } from '../../user/state/user.actions';
import { IModal } from '../model/modal.model';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';

export const STATE_SLICE_NAME = 'core';
export interface IState extends fromRoot.IState {
    core: ICoreState;
}

export interface ICoreState {
    ui: IUIState;
}

export interface IUIState {
    isBusy: boolean;
    alert: IAlert | null;
    modal: IModal;
}

const initialState: ICoreState = {
    ui: {
        isBusy: false,
        alert: null,
        modal: {
            config: {
                overlay: true,
                overlayClickToClose: false,
                showCloseButton: true,
                confirmText: 'Ok',
                declineText: 'Cancel'
            },
            show: false,
            title: ''
        }
    }
};

// SELECTORS
export const getCoreFeatureState = createFeatureSelector<ICoreState>(STATE_SLICE_NAME);

export const isBusy = createSelector(
    getCoreFeatureState,
    state => state.ui.isBusy
);

export const getAlert = createSelector(
    getCoreFeatureState,
    state => state.ui.alert
);

export const getModal = createSelector(
    getCoreFeatureState,
    state => state.ui.modal
);

// REDUCER
export function reducer(state: ICoreState = initialState, action: SystemActions): ICoreState {
    switch (action.type) {
        case SamplesActionTypes.SendSamplesConfirm:
            return {
                ...state,
                ... {
                    ui: {
                        ...state.ui, ...{
                            modal: {
                                ...state.ui.modal,
                                ...{
                                    title: action.payload.title,
                                    message: action.payload.message,
                                    show: true
                                }
                            }
                        }
                    }
                }
            };
        case CoreActionTypes.ClearAlert:
        case ROUTER_NAVIGATION:
            return {
                ...state, ...{
                    ui: {
                        ...state.ui, ...{
                            alert: null
                        }
                    }
                }
            };
        case CoreActionTypes.DisplayAlert:
            return {
                ...state, ...{
                    ui: {
                        ...state.ui, ...{
                            alert: action.payload
                        }
                    }
                }
            };
        case SamplesActionTypes.ValidateSamples:
        case SamplesActionTypes.ImportExcelFile:
        case UserActionTypes.LoginUser:
            return {
                ...state, ...{
                    ui: {
                        ...state.ui, ...{
                            isBusy: true
                        }
                    }
                }
            };
        case SamplesActionTypes.ValidateSamplesSuccess:
        case SamplesActionTypes.ImportExcelFileSuccess:
        case UserActionTypes.LoginUserSuccess:
            return {
                ...state, ...{
                    ui: {
                        ...state.ui, ...{
                            isBusy: false
                        }
                    }
                }
            };
        case SamplesActionTypes.ValidateSamplesFailure:
        case SamplesActionTypes.ImportExcelFileFailure:
        case UserActionTypes.LoginUserFailure:
        case SamplesActionTypes.SendSamplesFailure:
        case SamplesActionTypes.SendSamplesSuccess:
            return {
                ...state, ...{
                    ui: {
                        ...state.ui, ...{
                            isBusy: false,
                            alert: {
                                type: action.payload.type,
                                message: action.payload.message
                            }
                        }
                    }
                }
            };
        default:
            return state;
    }
}
