import { ResponseAction, CommandAction, CommandActionType } from './command.actions';
import { ActionReducer } from '@ngrx/store';

// STATE

export interface CommandStates {
    commandSources: Record<string, string>;
}

const initialCommandSources: Record<string, string> = {};

// REDUCER

export function commandSourcesReducer(
    state: Record<string, string> = initialCommandSources,
    action: CommandActionType
): Record<string, string> {
    if ('source' in action) {
        return { ...state, [action.type]: action.source };
    } else if ('command' in action) {
        return { ...state, [action.command]: '' };
    }

    return state;
}

// META REDUCER

export function responseMetaReducer(
    reducer: ActionReducer<CommandStates, CommandActionType>
    ): ActionReducer<CommandStates, CommandActionType> {
    return function (state, action) {
        if (state) {
            if ('command' in action) {
                action.commandSource = state.commandSources[action.command];
            }
        }
        return reducer(state, action);
    };
}
