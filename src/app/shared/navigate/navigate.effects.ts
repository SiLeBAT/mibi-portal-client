import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { LogService } from '../../core/services/log.service';
import _ from 'lodash';
import { navigateMSA } from './navigate.actions';
import { Router } from '@angular/router';

@Injectable()
export class NavigateEffects {

    constructor(
        private actions$: Actions,
        private router: Router,
        private logger: LogService
    ) { }

    navigate$ = createEffect(() => this.actions$.pipe(
        ofType(navigateMSA),
        concatMap(action => {
            try {
                this.router.navigate([action.url]).catch(error => {
                    this.logger.error('Error during navigation.', error.stack);
                });
            } catch (error) {
                this.logger.error('Unable to navigate.', error.stack);
            }
            return EMPTY;
        })
    ), { dispatch: false });
}
