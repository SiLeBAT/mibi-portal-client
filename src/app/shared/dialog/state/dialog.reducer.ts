import { DialogConfiguration } from '../dialog.model';
import { DialogAction, DialogActionTypes } from './dialog.actions';
import * as _ from 'lodash';

// STATE

export interface DialogState {
    dialogData: DialogData;
}

export interface DialogData {
    configuration: DialogConfiguration;
    caller: string;
}

const initialConfiguration: DialogConfiguration = {
    title: '',
    message: '',
    warnings: [],
    confirmButtonConfig: {
        label: ''
    }
};

const initialData: DialogData = {
    configuration: initialConfiguration,
    caller: ''
};

// REDUCER

export function dialogReducer(
    state: DialogData = initialData, action: DialogAction): DialogData {
    switch (action.type) {
        case DialogActionTypes.DialogOpenMTA:
            return { caller: action.target, configuration: _.cloneDeep(action.payload.configuration) };
        default:
            return state;
    }
}
