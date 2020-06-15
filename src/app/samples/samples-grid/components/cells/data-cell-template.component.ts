import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnnotatedSampleDataEntry, SampleValidationErrorCodes } from '../../../model/sample-management.model';
import { DataGridCellContext } from '../../../data-grid/data-grid.model';
import { SamplesGridTemplateContainer } from '../template-container';

@Component({
    selector: 'mibi-samples-grid-data-cell-template',
    templateUrl: './data-cell-template.component.html',
    styleUrls: ['./data-cell-template.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridDataCellTemplateComponent extends SamplesGridTemplateContainer<DataGridCellContext> {

    hasError(data: AnnotatedSampleDataEntry): boolean {
        return this.hasErrorCode(data, SampleValidationErrorCodes.ERROR);
    }

    hasWarning(data: AnnotatedSampleDataEntry): boolean {
        return this.hasErrorCode(data, SampleValidationErrorCodes.WARNING);
    }

    hasAutoCorrection(data: AnnotatedSampleDataEntry): boolean {
        return this.hasErrorCode(data, SampleValidationErrorCodes.AUTOCORRECTED);
    }

    hasCorrectionOffers(data: AnnotatedSampleDataEntry): boolean {
        return data.correctionOffer.length > 0;
    }

    isEdited(data: AnnotatedSampleDataEntry): boolean {
        return data.oldValue !== undefined;
    }

    private hasErrorCode(data: AnnotatedSampleDataEntry, code: SampleValidationErrorCodes): boolean {
        return !!data.errors.find((error) => error.level === code);
    }
}
