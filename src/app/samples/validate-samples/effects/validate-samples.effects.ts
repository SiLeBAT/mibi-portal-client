import { Injectable } from '@angular/core';
import {
    ValidateSamplesAction,
    ValidateSamples,
    ValidateSamplesActionTypes,
    ValidateSamplesSuccess,
    ValidateSamplesFailure
} from '../state/validate-samples.actions';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { SamplesSlice } from '../../samples.state';
import { Store } from '@ngrx/store';
import { withLatestFrom, concatMap, map, catchError } from 'rxjs/operators';
import { ValidationRequest } from '../../../core/model/request.model';
import { DataService } from '../../../core/services/data.service';
import { AnnotatedSampleData } from '../../model/sample-management.model';
import { of, Observable } from 'rxjs';
import { DisplayBanner } from '../../../core/state/core.actions';
import { LogService } from '../../../core/services/log.service';
import { Samples } from '../../samples.store';
import * as fromUser from '../../../user/state/user.reducer';
import { InstitutionDTO } from '../../../user/model/institution.model';
import * as _ from 'lodash';
import { selectDataValues, selectNRL } from '../../state/samples.reducer';

@Injectable()
export class ValidateSamplesEffects {

    constructor(
        private actions$: Actions<ValidateSamplesAction>,
        private dataService: DataService,
        private logger: LogService,
        private store$: Store<Samples & fromUser.State>
        ) {}

    @Effect()
    validateSamples$: Observable<ValidateSamplesSuccess | ValidateSamplesFailure | DisplayBanner> = this.actions$.pipe(
        ofType<ValidateSamples>(ValidateSamplesActionTypes.ValidateSamples),
        withLatestFrom(this.store$),
        concatMap(([, state]) => {
            const validationRequest: ValidationRequest = this.createValidationRequestFromState(state);
            return this.dataService.validateSampleData(validationRequest).pipe(
                map((annotatedSamples: AnnotatedSampleData[]) => {
                    return new ValidateSamplesSuccess(annotatedSamples);
                }),
                catchError((error) => {
                    this.logger.error('Failed to validate samples', error);
                    return of(
                        new DisplayBanner({ predefined: 'validationFailure' }),
                        new ValidateSamplesFailure()
                        );
                })
            );
        })
    );

    private createValidationRequestFromState(state: Samples & fromUser.State): ValidationRequest {
        return {
            data: selectDataValues(state),
            meta: this.getValidationRequestMetaData(state)
        };
    }

    private getValidationRequestMetaData(state: Samples & fromUser.State) {
        const cu = fromUser.getCurrentUser(state) || null;
        return {
            state: cu ? this.getStateShortFor(cu.instituteId, state) : '',
            nrl: selectNRL(state)
        };
    }

    private getStateShortFor(id: string, state: fromUser.State): string {
        const inst: InstitutionDTO[] = fromUser.getInstitutions(state);
        const entry = _.find(inst, e => e._id === id);
        return entry ? entry.short : '';
    }
}
