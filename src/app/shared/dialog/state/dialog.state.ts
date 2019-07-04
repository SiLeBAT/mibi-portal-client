import { DialogConfiguration } from '../dialog.model';
import { DialogAction, DialogActionTypes } from './dialog.actions';
import * as _ from 'lodash';

// STATE

export interface DialogStates {
    dialogConfiguration: DialogConfiguration;
}

const initialConfiguration: DialogConfiguration = {
    title: '',
    message: '',
    warnings: [],
    confirmButtonConfig: {
        label: ''
    }
};

// REDUCER

export function dialogConfigurationReducer(
    state: DialogConfiguration = initialConfiguration, action: DialogAction): DialogConfiguration {
    switch (action.type) {
        case DialogActionTypes.DialogOpen:
            return _.cloneDeep(action.payload.configuration);
        default:
            return state;
    }
}
