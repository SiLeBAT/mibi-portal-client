import { createAction, props } from '@ngrx/store';
import { ExcelFile } from '../model/sample-management.model';

export const importSamplesMSA = createAction(
    '[Samples/ImportSamples] Import samples from Excel file',
    props<{ excelFile: ExcelFile }>()
);
