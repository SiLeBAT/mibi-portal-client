import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { UserActionViewModelConfiguration, UserActionType, ColorType } from '../../shared/model/user-action.model';
import { Store } from '@ngrx/store';
import { ClientError } from '../model/client-error';
import { Router } from '@angular/router';
import { ValidateSamplesSSA } from '../../samples/validate-samples/validate-samples.actions';
import { CoreMainSlice } from '../core.state';
import { environment } from '../../../environments/environment';
import { CloseSamplesSSA } from '../../samples/close-samples/close-samples.actions';
import { UploadSamplesMSA } from '../../samples/upload-samples.ts/upload-samples.actions';
import { DownloadSamplesSSA } from '../../samples/download-samples/download-samples.actions';
import { SendSamplesSSA } from '../../samples/send-samples/state/send-samples.actions';

@Injectable({
    providedIn: 'root'
})
export class UserActionService {

    userActionConfiguration: UserActionViewModelConfiguration[] = [{
        label: 'Validieren',
        type: UserActionType.VALIDATE,
        onExecute: this.validate.bind(this),
        icon: 'spellcheck',
        color: ColorType.ACCENT
    },
    {
        label: 'Hochladen',
        type: UserActionType.UPLOAD,
        onExecute: this.import.bind(this),
        icon: 'publish',
        color: ColorType.ACCENT
    },
    {
        label: 'Exportieren',
        type: UserActionType.EXPORT,
        onExecute: this.export.bind(this),
        icon: 'file_copy',
        color: ColorType.ACCENT
    },
    {
        label: 'Senden',
        type: UserActionType.SEND,
        onExecute: this.send.bind(this),
        icon: 'send',
        color: ColorType.ACCENT
    },
    {
        label: 'Schließen',
        type: UserActionType.DISMISS_BANNER,
        onExecute: () => null,
        icon: '',
        color: ColorType.ACCENT
    },
    {
        label: 'Schließen',
        type: UserActionType.CLOSE,
        onExecute: this.close.bind(this),
        icon: 'clear',
        color: ColorType.ACCENT
    },
    {
        label: 'Excel-Vorlage',
        type: UserActionType.DOWNLOAD_TEMPLATE,
        onExecute: () => {
            window.open(environment.sampleSheetURL, '_blank');
        },
        icon: 'assignment_returned',
        color: ColorType.ACCENT
    }];

    constructor(
        private store$: Store<CoreMainSlice>, private router: Router) { }

    getConfigOfType(type: UserActionType): UserActionViewModelConfiguration {
        const config = _.find(this.userActionConfiguration, (c: UserActionViewModelConfiguration) => c.type === type);
        return config ? _.cloneDeep(config) : {
            label: '',
            type: UserActionType.CUSTOM,
            onExecute: () => null,
            icon: '',
            color: ColorType.ACCENT
        };
    }

    getNavigationConfig(url: string): UserActionViewModelConfiguration {
        return {
            label: 'Navigieren',
            type: UserActionType.NAVIGATE,
            onExecute: this.navigate.bind(this, url),
            icon: '',
            color: ColorType.ACCENT
        };
    }

    private navigate(url: string) {
        this.router.navigate([url]).catch(() => {
            throw new ClientError('Unable to navigate.');
        });
    }

    private validate() {
        this.store$.dispatch(new ValidateSamplesSSA());
    }

    private export() {
        this.store$.dispatch(new DownloadSamplesSSA());
    }

    private import(file: File) {
        this.store$.dispatch(new UploadSamplesMSA({ excelFile: { file } }));
    }

    private send() {
        this.store$.dispatch(new SendSamplesSSA());
    }

    private close() {
        this.store$.dispatch(new CloseSamplesSSA());
    }
}
