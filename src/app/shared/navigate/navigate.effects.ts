import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';
import { LogService } from '../../core/services/log.service';
import * as _ from 'lodash';
import { NavigateAction, NavigateActionTypes, NavigateMSA } from './navigate.actions';
import { Router } from '@angular/router';

@Injectable()
export class NavigateEffects {

    constructor(
        private actions$: Actions<NavigateAction>,
        private router: Router,
        private logger: LogService
    ) { }

    @Effect()
    navigate$: Observable<never> = this.actions$.pipe(
        ofType<NavigateMSA>(NavigateActionTypes.NavigateMSA),
        concatMap(action => {
            try {
                this.router.navigate([action.payload.url]).catch(error => {
                    this.logger.error('Error during navigation.', error.stack);
                });
            } catch (error) {
                this.logger.error('Unable to navigate.', error.stack);
            }
            return EMPTY;
        })
    );
}
