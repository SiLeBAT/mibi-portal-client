import { Component, Output, EventEmitter } from '@angular/core';

export enum UploadErrorType {
    SIZE = 'fileSize',
    TYPE = 'accept',
    CLEAR = 'clear'
}
@Component({
    selector: 'mibi-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.css']
})
export class UploadComponent {

    dropDisabled = false;
    private _lastInvalids: any[] = [];
    maxFileSize = 2097152;

    @Output() invokeValidation = new EventEmitter();
    @Output() errorHandler = new EventEmitter();

    constructor() { }

    get lastInvalids(): any[] {
        return this._lastInvalids;
    }

    set lastInvalids(val: any[]) {
        this._lastInvalids = val;
        if (val && val[0]) {
            this.errorHandler.emit(val[0].type);

        } else {
            this.errorHandler.emit(UploadErrorType.CLEAR);
        }
    }

    onFileChange(file: File) {
        this.invokeValidation.emit(file);
    }

}
