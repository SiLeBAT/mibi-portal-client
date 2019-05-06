import { CommandAction, ResponseAction, CommandActionType } from './command/command.actions';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { CommandStates, commandSourcesReducer, responseMetaReducer } from './command/command.state';

type SharedStates = CommandStates;
type SharedAction = CommandActionType;

export const sharedReducerMap: ActionReducerMap<SharedStates, SharedAction> = {
    commandSources: commandSourcesReducer
};
export const sharedEffects = [
];

export const sharedMetaReducers: MetaReducer<CommandStates, CommandActionType>[] = [responseMetaReducer];