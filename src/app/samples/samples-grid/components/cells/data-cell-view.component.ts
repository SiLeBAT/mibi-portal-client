import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AnnotatedSampleDataEntry, SampleValidationErrorCodes } from '../../../model/sample-management.model';

@Component({
    selector: 'mibi-samples-grid-data-cell-view',
    templateUrl: './data-cell-view.component.html',
    styleUrls: ['./data-cell-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridDataCellViewComponent {

    get foo() {
        // console.log('datacell');
        return '';
    }

    @Input() data: AnnotatedSampleDataEntry;

    hasError(): boolean {
        return this.hasErrorCode(SampleValidationErrorCodes.ERROR);
    }

    hasWarning(): boolean {
        return this.hasErrorCode(SampleValidationErrorCodes.WARNING);
    }

    hasAutoCorrection(): boolean {
        return this.hasErrorCode(SampleValidationErrorCodes.AUTOCORRECTED);
    }

    isEdited(): boolean {
        return this.data.oldValue !== undefined;
    }

    private hasErrorCode(code: SampleValidationErrorCodes): boolean {
        return !!this.data.errors.find((error) => error.level === code);
    }

}
