import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DataGridCellContext } from '../../../data-grid/data-grid.model';
import { SamplesGridTemplateContainer } from '../template-container';
import { SamplesGridDataCellData } from '../../samples-grid.model';
import { SampleValidationErrorLevel } from '../../../model/sample-management.model';
// import { SoftLineBreaksPipe } from '../../../../shared/presentation/pipes/soft-line-breaks.pipe';

@Component({
    selector: 'mibi-samples-grid-data-cell-template',
    templateUrl: './data-cell-template.component.html',
    styleUrls: ['./data-cell-template.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridDataCellTemplateComponent extends SamplesGridTemplateContainer<DataGridCellContext> {

    hasError(data: SamplesGridDataCellData): boolean {
        return this.hasErrorLevel(data, SampleValidationErrorLevel.ERROR);
    }

    hasWarning(data: SamplesGridDataCellData): boolean {
        return this.hasErrorLevel(data, SampleValidationErrorLevel.WARNING);
    }

    hasAutoCorrection(data: SamplesGridDataCellData): boolean {
        return this.hasErrorLevel(data, SampleValidationErrorLevel.AUTOCORRECTED);
    }

    hasCorrectionOffers(data: SamplesGridDataCellData): boolean {
        return data.correctionOffer.length > 0;
    }

    isEdited(data: SamplesGridDataCellData): boolean {
        return data.oldValue !== undefined;
    }

    private hasErrorLevel(data: SamplesGridDataCellData, level: SampleValidationErrorLevel): boolean {
        return data.errors.some((error) => error.level === level);
    }
}
