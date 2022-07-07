import { Action, ActionReducerMap } from '@ngrx/store';
import { InitEffects } from './init/init.effects';

type MainState = Record<string, unknown>;

export const mainReducerMap: ActionReducerMap<MainState, Action> = {
};

export const mainEffects = [
    InitEffects
];
