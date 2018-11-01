import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromCore from '../../state/core.reducer';
import * as coreActions from '../../state/core.actions';
import { Observable } from 'rxjs';
import { Banner, AlertType, ButtonConfig } from '../../model/alert.model';
import { map } from 'rxjs/operators';

@Component({
    selector: 'mibi-banner-container',
    template: `<mibi-banner [banner]="banner$ | async"></mibi-banner>`
})
export class BannerContainerComponent implements OnInit {

    // TODO: Define User actions separately!
    private dismissButton: ButtonConfig = {
        label: 'Verwerfen',
        onClick: this.dismissAction.bind(this)
    };
    private banners: Record<string, Banner> = {
        defaultError: {
            message: 'Ein Fehler ist aufgetreten.',
            mainButton: this.dismissButton,
            type: AlertType.ERROR,
            icon: 'error'
        },
        defaultSuccess: {
            message: 'Operation erfolgreich durchgeführt.',
            mainButton: this.dismissButton,
            type: AlertType.SUCCESS,
            icon: 'done'
        },
        noAuthorizationOrActivation: {
            message: 'Nicht authorisiert oder nicht aktiviert. '
                + 'Wenn bereits registriert, überprüfen Sie bitte Ihre Email auf einen Aktivierungslink',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        sendCancel: {
            message: 'Es wurden keine Probendaten an das BfR gesendet',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        validationFailure: {
            message: 'Es gab einen Fehler beim Validieren.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        uploadFailure: {
            message: 'Es gab einen Fehler beim Importieren der Datei.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        sendFailure: {
            message: 'Es gab einen Fehler beim Versenden der Datei and das MiBi-Portal.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        sendSuccess: {
            type: AlertType.SUCCESS,
            message: `Der Auftrag wurde an das BfR gesendet.
            Bitte drucken Sie die Exceltabelle in Ihrem Mailanhang
            aus und legen sie Ihren Isolaten bei.`,
            mainButton: this.dismissButton
        },
        // TODO: Add Send auxilliary action
        validationErrors: {
            message: 'Es gibt noch rot gekennzeichnete Fehler. Bitte vor dem Senden korrigieren.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        // TODO: Add Send auxilliary action
        autocorrections: {
            message: 'Es wurden Felder autokorregiert. Bitte prüfen und nochmals senden.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        wrongUploadDatatype: {
            type: AlertType.ERROR,
            message: 'Falscher Dateityp: Dateien müssen vom Typ .xlsx sein.',
            mainButton: this.dismissButton
        },
        wrongUploadFilesize: {
            type: AlertType.ERROR,
            message: 'Zu grosse Datei: Dateien müssen kleiner als 2 Mb sein.',
            mainButton: this.dismissButton
        },
        accountActivationSuccess: {
            message: 'Kontoaktivierung erfolgreich!',
            type: AlertType.SUCCESS,
            mainButton: this.dismissButton
        },
        accountActivationFailure: {
            message: 'Unable to activate account.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        // TODO: Add Login auxilliary action
        passwordChangeSuccess: {
            message: 'Bitte melden Sie sich mit Ihrem neuen Passwort an',
            type: AlertType.SUCCESS,
            mainButton: this.dismissButton
        },
        // TODO: Add Password reset auxilliary action
        passwordChangeFailure: {
            // tslint:disable-next-line:max-line-length
            message: `Fehler beim Passwort zurücksetzten, Token ungültig. Bitte lassen Sie sich einen neuen 'Passwort-Reset' Link mit Hilfe der Option 'Passwort vergessen?' zuschicken.`,
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        // TODO: Add Register auxilliary action
        loginFailure: {
            // tslint:disable-next-line:max-line-length
            message: 'Es gab einen Fehler beim einloggen.  Bitte registrieren Sie sich oder, wenn Sie sich schon registriert haben, kontaktieren Sie das MiBi-Portal team.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        },
        // TODO: Add Login auxilliary action
        loginUnauthorized: {
            message: 'Nicht authorisiert, bitte einloggen.',
            type: AlertType.ERROR,
            mainButton: this.dismissButton
        }
    };
    banner$: Observable<Banner | null>;
    constructor(private store: Store<fromCore.State>) { }

    ngOnInit() {
        this.banner$ = this.store.pipe(select(fromCore.getBanner),
            map(b => {
                if (b) {
                    const banner = this.banners[b.predefined] || b.custom;
                    if (banner) {
                        if (!banner.mainButton) {
                            banner.mainButton = this.dismissButton;
                        }
                        if (!banner.icon) {
                            switch (banner.type) {
                                case AlertType.ERROR:
                                    banner.icon = 'error';
                                    break;
                                case AlertType.SUCCESS:
                                    banner.icon = 'done';
                                    break;
                                case AlertType.WARNING:
                                default:
                                    banner.icon = 'warning';
                            }
                        }
                        return banner;
                    }
                }
                return null;
            }));
    }

    dismissAction() {
        this.store.dispatch(new coreActions.ClearBanner());
    }

}
