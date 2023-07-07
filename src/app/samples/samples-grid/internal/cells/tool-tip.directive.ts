import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import 'tooltipster';
import { createToolTip, ToolTipTheme, ToolTipAlignment } from '../../../../shared/model/tooltip.model';
import { samplesGridToolTipOldValuePreamble, samplesGridToolTipOldValueEmpty } from '../../tool-tip.constants';
import { SamplesGridDataCellData } from '../../samples-grid.model';
import { SampleValidationErrorLevel } from '../../../model/sample-management.model';

@Directive({
    selector: '[mibiSamplesGridToolTip]'
})
export class SamplesGridToolTipDirective implements OnChanges {
    @Input('mibiSamplesGridToolTip') data: SamplesGridDataCellData;

    constructor(private hostElement: ElementRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.destroyToolTips();
            if (changes['data'].currentValue !== undefined) {
                this.createToolTips();
            }
        }
    }

    private destroyToolTips(): void {
        // eslint-disable-next-line
        $.tooltipster.instances(this.hostElement.nativeElement).forEach(el => { el.destroy(); });
    }

    private createToolTips(): void {
        const oldValues: string[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];
        const autoCorrections: string[] = [];

        if (this.data.oldValue !== undefined) {
            let message = samplesGridToolTipOldValuePreamble;
            message += this.data.oldValue === '' ? samplesGridToolTipOldValueEmpty : this.data.oldValue;
            oldValues.push(message);
        }

        for (const validationError of this.data.errors) {
            switch (validationError.level) {
                case SampleValidationErrorLevel.ERROR:
                    errors.push(validationError.message);
                    break;
                case SampleValidationErrorLevel.WARNING:
                    warnings.push(validationError.message);
                    break;
                case SampleValidationErrorLevel.AUTOCORRECTED:
                    autoCorrections.push(validationError.message);
                    break;
            }
        }

        this.createToolTip(oldValues, ToolTipTheme.TIP, 'right');
        this.createToolTip(errors, ToolTipTheme.ERROR, 'top');
        this.createToolTip(warnings, ToolTipTheme.WARNING, 'bottom');
        this.createToolTip(autoCorrections, ToolTipTheme.INFO, 'left');
    }

    private createToolTip(messages: string[], theme: ToolTipTheme, alignment: ToolTipAlignment): void {
        if (messages.length <= 0) {
            return;
        }

        const options = createToolTip(theme, alignment).getOptions(messages);
        $(this.hostElement.nativeElement).tooltipster(options);
    }
}
