import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SampleData, IAnnotatedSampleData } from '../../model/sample-management.model';
import { ExcelToJsonService, IExcelData } from '../../services/excel-to-json.service';
import { ValidationService } from '../../services/validation.service';
import { AlertService } from '../../../core/services/alert.service';
import { LoadingSpinnerService } from '../../../core/services/loading-spinner.service';
import { SampleStore } from '../../services/sample-store.service';
import { UploadErrorType } from '../../presentation/upload/upload.component';

@Component({
    selector: 'mibi-upload-container',
    template: `<mibi-upload
    (invokeValidation)="invokeValidation($event)"
    (errorHandler)="onError($event)">
    </mibi-upload>`
})
export class UploadContainerComponent {

    private onUploadSpinner = 'uploadSpinner';

    constructor(
        private excelToJsonService: ExcelToJsonService,
        private validationService: ValidationService,
        private alertService: AlertService,
        private router: Router,
        private spinnerService: LoadingSpinnerService,
        private sampleStore: SampleStore) { }

    onError(error: UploadErrorType) {
        switch (error) {
            case UploadErrorType.SIZE:
                this.alertService.error('Zu grosse Datei: Dateien müssen kleiner als 2 Mb sein.', false);
                break;
            case UploadErrorType.TYPE:
                this.alertService.error('Falscher Dateityp: Dateien müssen vom Typ .xlsx sein.', true);
                break;
            case UploadErrorType.CLEAR:
                this.alertService.clear().catch(() => {
                    throw new Error('Unable to clear alert.');
                });
                break;
            default:
                this.alertService.error('Die Datei konnte nicht hochgeladen werden.', false);
        }
    }

    private async readFileAndValidate(file: File) {
        this.spinnerService.show(this.onUploadSpinner);
        const excelData: IExcelData = await this.excelToJsonService.convertExcelToJSJson(file).then(
            (uploadedData: IExcelData) => {
                return uploadedData;
            }
        );
        this.sampleStore.setState({
            entries: excelData.data.data.map(e => ({
                data: e,
                errors: {},
                corrections: [],
                edits: {}
            })),
            workSheet: excelData.workSheet
        });
        const data: SampleData[] = this.sampleStore.state.entries.map(e => e.data);

        if (data) {
            this.validationService.validate(data).then(
                (validationResponse: IAnnotatedSampleData[]) => {
                    this.sampleStore.mergeValidationResponseIntoState(validationResponse);
                    this.router.navigate(['/samples']).catch(() => {
                        throw new Error('Unable to navigate.');
                    });
                    this.spinnerService.hide(this.onUploadSpinner);
                }
            ).catch(
                (err: Error) => { throw err; }
            );
        }
    }

    invokeValidation(file: File) {
        this.readFileAndValidate(file).catch(() => {
            throw new Error('Unable to invoke validation.');
        });
    }
}
