import { createReducer, on } from '@ngrx/store';
import { routerNavigationAction } from '@ngrx/router-store';
import { ActionBarConfig } from '../action-bar/action-bar.model';
import {
    configureActionBarSOA,
    hideActionBarSOA,
    updateActionBarTitleSOA
} from './action-bar.actions';

export interface MainState {
    actionBar: ActionBarConfig;
}

const initialActionBarConfig: ActionBarConfig = {
    isEnabled: false,
    title: '',
    items: []
};

export const mainActionBarReducer = createReducer(
    initialActionBarConfig,
    on(configureActionBarSOA, (_state, action) => ({
        isEnabled: true,
        title: action.title,
        items: action.items
    })),
    on(updateActionBarTitleSOA, (state, action) => ({
        ...state,
        title: action.title
    })),
    on(hideActionBarSOA, () => initialActionBarConfig),
    // The bar belongs to the page that configured it, so leaving the page
    // clears it; the next page configures its own.
    on(routerNavigationAction, () => initialActionBarConfig)
);
