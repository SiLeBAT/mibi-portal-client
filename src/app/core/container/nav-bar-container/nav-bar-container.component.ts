import { Component } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { SampleStore } from '../../../sampleManagement/services/sample-store.service';
import { environment } from '../../../../environments/environment';
import { ValidationService } from '../../../sampleManagement/services/validation.service';
import { ExportService } from '../../../sampleManagement/services/export.service';
import { SendSampleService } from '../../../sampleManagement/services/send-sample.service';
import { IAnnotatedSampleData, SampleData } from '../../../sampleManagement/models/sample-management.model';
import { AlertService } from '../../../shared/services/alert.service';
import { SampleSheetUtilService } from '../../../sampleManagement/services/sample-sheet-util.service';
import { ConfirmationService, ConfirmSettings, ResolveEmit } from '@jaspero/ng-confirmations';
import { INavBarConfiguration } from '../../presentation/nav-bar/nav-bar.component';

@Component({
    selector: 'app-nav-bar-container',
    template: `<app-nav-bar
    [config]="viewConfig"
    [currentUser]="getCurrentUser()"
    (onValidate)="onValidate()"
    (onSend)="onSend()"
    (onExport)="onExport()"
    (onLogout)="onLogout()">
    </app-nav-bar>`
})
export class NavBarContainerComponent {

    viewConfig: INavBarConfiguration = {
        appName: environment.appName
    };

    constructor(public authService: AuthService,
        private router: Router,
        private sampleStore: SampleStore,
        private validationService: ValidationService,
        private exportService: ExportService,
        private sendSampleService: SendSampleService,
        private alertService: AlertService,
        private sampleSheetUtil: SampleSheetUtilService,
        private confirmationService: ConfirmationService) { }

    onValidate() {
        this.alertService.clear().catch(
            err => { throw err; }
        );
        this.doValidation().catch(
            this.handleError('Problem beim Validieren der Daten')
        );
        this.router.navigate(['/samples']).catch(
            this.handleError('Problem beim Navigieren')
        );
    }

    onExport() {
        this.alertService.clear().catch(
            err => { throw err; }
        );
        this.exportService.export(this.sampleStore.state).catch(
            this.handleError('Problem beim Speichern der validierten Daten als Excel')
        );
    }

    async onSend() {
        this.alertService.clear().catch(
            err => { throw err; }
        );
        await this.doValidation().catch(
            this.handleError('Problem beim Versenden der Daten')
        );

        if (this.sampleSheetUtil.hasErrors(this.sampleStore.state)) {
            this.alertService.error('Es gibt noch rot gekennzeichnete Fehler. Bitte vor dem Senden korrigieren.', false);
            return;
        }
        const options: ConfirmSettings = {
            overlay: true,
            overlayClickToClose: false,
            showCloseButton: true,
            confirmText: 'Ok',
            declineText: 'Cancel'
        };

        this.confirmationService.create('Senden', `<p>Ihre Probendaten werden jetzt an das BfR gesendet.</p>
                                               <p>Bitte vergessen Sie nicht die Exceltabelle in Ihrem Mailanhang
                                               auszudrucken und Ihren Isolaten beizulegen.</p>`, options)
            .subscribe((ans: ResolveEmit) => {
                if (ans.resolved) {
                    this.sendSampleService.sendData(this.sampleStore.state, this.authService.getCurrentUser())
                        .then(
                            response => {
                                const message = `Der Auftrag wurde an das BfR gesendet.
                                             Bitte drucken Sie die Exceltabelle in Ihrem Mailanhang
                                            aus und legen sie Ihren Isolaten bei.`;
                                this.alertService.success(message, false);
                            },
                            fail => {

                            }
                        )
                        .catch(
                            err => {
                                this.alertService.error(err['error']['error'], false);
                                throw err;
                            }
                        );
                } else {
                    this.alertService.error('Es wurden keine Probendaten an das BfR gesendet', false);
                }
            });
    }

    onLogout() {
        this.authService.logout();
    }

    getCurrentUser() {
        return this.authService.getCurrentUser();
    }
    private doValidation() {
        const data: SampleData[] = this.sampleStore.state.entries.map(e => e.data);
        return this.validationService.validate(data).then(
            (validationResponse: IAnnotatedSampleData[]) => {
                this.sampleStore.mergeValidationResponseIntoState(validationResponse);
            }
        );
    }

    private handleError(message: string) {
        return (err: Error) => {
            this.alertService.error(message, false);
            throw err;
        };
    }
}
