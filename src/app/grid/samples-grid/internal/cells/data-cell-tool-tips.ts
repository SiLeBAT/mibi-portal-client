import {
    ToolTip,
    ToolTipTheme,
    createToolTip
} from '../../../../shared/tooltip/tooltip.model';
import { SampleValidationErrorLevel } from '../../../../samples/model/sample-management.model';
import { SamplesGridDataCellData } from '../../samples-grid.model';
import {
    samplesGridToolTipOldValueEmpty,
    samplesGridToolTipOldValuePreamble
} from '../../tool-tip.constants';

/**
 * The tooltips a data cell shows: what the cell used to hold, and whatever the
 * validation had to say about it, each on its own side of the cell.
 *
 * Which validation level means what is the grid's business, so the mapping
 * stays here; attaching the tooltips is the tooltip component's.
 */
export function samplesGridDataCellToolTips(
    data: SamplesGridDataCellData
): ToolTip[] {
    const oldValues: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const autoCorrections: string[] = [];

    if (data.oldValue !== undefined) {
        const shown = data.oldValue === ''
            ? samplesGridToolTipOldValueEmpty
            : data.oldValue;
        oldValues.push(samplesGridToolTipOldValuePreamble + shown);
    }

    for (const validationError of data.errors) {
        switch (validationError.level) {
            case SampleValidationErrorLevel.ERROR:
                errors.push(...validationError.message.split('|'));
                break;
            case SampleValidationErrorLevel.WARNING:
                warnings.push(...validationError.message.split('|'));
                break;
            case SampleValidationErrorLevel.AUTOCORRECTED:
                autoCorrections.push(validationError.message);
                break;
        }
    }

    return [
        createToolTip(ToolTipTheme.TIP, 'right', oldValues),
        createToolTip(ToolTipTheme.ERROR, 'top', errors),
        createToolTip(ToolTipTheme.WARNING, 'bottom', warnings),
        createToolTip(ToolTipTheme.INFO, 'left', autoCorrections)
    ];
}
