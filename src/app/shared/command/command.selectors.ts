import { OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ResponseAction } from './command.actions';

export function fromSource<T extends ResponseAction>(...allowedSources: string[]): OperatorFunction<T, T> {
    return filter((action) => allowedSources.some(source => source === action.commandSource));
}
