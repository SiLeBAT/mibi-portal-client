import { Action } from '@ngrx/store';

export interface CommandAction extends Action {
    source: string;
}

export interface ResponseAction extends Action {
    command: string;
    commandSource?: string;
}

export type CommandActionType = CommandAction | ResponseAction;
