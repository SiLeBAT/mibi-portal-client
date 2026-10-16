import { SampleValidationErrorLevel } from '../../../../samples/model/sample-management.model';
import { ToolTipTheme } from '../../../../shared/tooltip/tooltip.model';
import { SamplesGridDataCellData } from '../../samples-grid.model';
import {
    samplesGridToolTipOldValueEmpty,
    samplesGridToolTipOldValuePreamble
} from '../../tool-tip.constants';
import { samplesGridDataCellToolTips } from './data-cell-tool-tips';

function cell(data: Partial<SamplesGridDataCellData> = {}): SamplesGridDataCellData {
    return {
        value: 'a value',
        errors: [],
        correctionOffer: [],
        ...data
    } as SamplesGridDataCellData;
}

function messagesOf(data: SamplesGridDataCellData, theme: ToolTipTheme): string[] {
    const toolTip = samplesGridDataCellToolTips(data)
        .find(candidate => candidate.theme === theme);
    return toolTip ? toolTip.messages : [];
}

describe('samplesGridDataCellToolTips', () => {

    it('says nothing about a cell that is untouched and valid', () => {
        const toolTips = samplesGridDataCellToolTips(cell());

        expect(toolTips.every(toolTip => toolTip.messages.length === 0)).toBe(true);
    });

    it('covers every theme so each keeps its own side of the cell', () => {
        const toolTips = samplesGridDataCellToolTips(cell());

        expect(toolTips.map(toolTip => [toolTip.theme, toolTip.alignment])).toEqual([
            [ToolTipTheme.TIP, 'right'],
            [ToolTipTheme.ERROR, 'top'],
            [ToolTipTheme.WARNING, 'bottom'],
            [ToolTipTheme.INFO, 'left']
        ]);
    });

    it('reports the previous value of an edited cell as a tip', () => {
        const data = cell({ oldValue: 'was this' });

        expect(messagesOf(data, ToolTipTheme.TIP)).toEqual([
            samplesGridToolTipOldValuePreamble + 'was this'
        ]);
    });

    it('spells out a previous value that was empty', () => {
        const data = cell({ oldValue: '' });

        expect(messagesOf(data, ToolTipTheme.TIP)).toEqual([
            samplesGridToolTipOldValuePreamble + samplesGridToolTipOldValueEmpty
        ]);
    });

    it('sorts each validation level into its own tooltip', () => {
        const data = cell({
            errors: [
                { code: 1, level: SampleValidationErrorLevel.ERROR, message: 'bad' },
                { code: 2, level: SampleValidationErrorLevel.WARNING, message: 'odd' },
                { code: 3, level: SampleValidationErrorLevel.AUTOCORRECTED, message: 'fixed' }
            ]
        });

        expect(messagesOf(data, ToolTipTheme.ERROR)).toEqual(['bad']);
        expect(messagesOf(data, ToolTipTheme.WARNING)).toEqual(['odd']);
        expect(messagesOf(data, ToolTipTheme.INFO)).toEqual(['fixed']);
    });

    it('splits a multi-part error message into one bullet per part', () => {
        const data = cell({
            errors: [
                { code: 1, level: SampleValidationErrorLevel.ERROR, message: 'first|second' }
            ]
        });

        expect(messagesOf(data, ToolTipTheme.ERROR)).toEqual(['first', 'second']);
    });

    it('leaves an auto-correction message whole, pipe and all', () => {
        const data = cell({
            errors: [
                {
                    code: 1,
                    level: SampleValidationErrorLevel.AUTOCORRECTED,
                    message: 'kept|together'
                }
            ]
        });

        expect(messagesOf(data, ToolTipTheme.INFO)).toEqual(['kept|together']);
    });

    it('collects several errors of the same level into one tooltip', () => {
        const data = cell({
            errors: [
                { code: 1, level: SampleValidationErrorLevel.ERROR, message: 'one' },
                { code: 2, level: SampleValidationErrorLevel.ERROR, message: 'two' }
            ]
        });

        expect(messagesOf(data, ToolTipTheme.ERROR)).toEqual(['one', 'two']);
    });
});
