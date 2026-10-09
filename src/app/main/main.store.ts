import { Action, ActionReducerMap } from '@ngrx/store';
import { InitEffects } from './init/init.effects';
import { MainState, mainActionBarReducer } from './state/main.reducer';

export const mainReducerMap: ActionReducerMap<MainState, Action> = {
    actionBar: mainActionBarReducer
};

export const mainEffects = [
    InitEffects
];
