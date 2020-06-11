import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SamplesGridTemplateContainer } from '../template-container';
import { DataGridEditorContext } from '../../../data-grid/data-grid.model';

@Component({
    selector: 'mibi-samples-grid-data-editor-template',
    template: `
        <ng-template #template
            let-data="data"
            let-dataChange="dataChange"
            let-confirm="confirm"
            let-cancel="cancel"
        >
            <mibi-samples-grid-data-editor-view
                [data]="data"
                (dataValueChange)="dataChange($event)"
                (confirm)="confirm()"
                (cancel)="cancel()"
            ></mibi-samples-grid-data-editor-view>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SamplesGridDataEditorTemplateComponent extends SamplesGridTemplateContainer<DataGridEditorContext> {}
