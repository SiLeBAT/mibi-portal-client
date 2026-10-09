import { Action, ActionReducerMap } from '@ngrx/store';
import {
    CoreMainState,
    coreIsBusyReducer,
    coreBannerReducer,
    coreIsAlternativeWelcomePageReducer,
    coreZomoPlanFilesReducer,
    coreWelcomePageReducer
} from './state/core.reducer';
import { CoreMainEffects } from './core.effects';
import { DownloadZomoPlanFileEffects } from './download-zomo-plan-file/download-zomo-plan-file.effects';
import { DownloadZomoPlanFileActionBarEffects } from './download-zomo-plan-file/download-zomo-plan-file.action-bar.effects';

type CoreState = CoreMainState;

export const coreReducerMap: ActionReducerMap<CoreState, Action> = {
    isBusy: coreIsBusyReducer,
    banner: coreBannerReducer,
    alternativeWelcomePage: coreIsAlternativeWelcomePageReducer,
    zomoPlanFiles: coreZomoPlanFilesReducer,
    welcomePage: coreWelcomePageReducer
};

export const coreEffects = [
    CoreMainEffects,
    DownloadZomoPlanFileEffects,
    DownloadZomoPlanFileActionBarEffects
];
