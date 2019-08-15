import { Action } from '@ngrx/store';
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface MultiTargetAction extends Action {
    target: string;
}

export function ofTarget<T extends MultiTargetAction>(...allowedSources: string[]): OperatorFunction<T, T> {
    return filter((action) => allowedSources.some(source => source === action.target));
}
