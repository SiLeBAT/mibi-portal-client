import { DialogConfiguration } from '../dialog.model';
import { dialogOpenMTA } from './dialog.actions';
import { createReducer, on } from '@ngrx/store';

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

export const dialogReducer = createReducer(
    initialData,
    on(dialogOpenMTA, (_state, action) => ({
        caller: action.target,
        configuration: action.configuration
    }))
);
