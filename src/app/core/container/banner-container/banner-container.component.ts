import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as fromCore from '../../state/core.reducer';
import { Observable } from 'rxjs';
import { Banner, AlertType } from '../../model/alert.model';
import { map } from 'rxjs/operators';
import { UserActionService } from '../../services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';

@Component({
    selector: 'mibi-banner-container',
    template: `<mibi-banner *ngIf="banner$ | async" [banner]="banner$ | async"></mibi-banner>`
})
export class BannerContainerComponent implements OnInit {

    private banners: Record<string, Banner> = {
        defaultError: {
            message: 'Ein Fehler ist aufgetreten.',

            type: AlertType.ERROR,
            icon: 'error'
        },
        defaultSuccess: {
            message: 'Operation erfolgreich durchgeführt.',

            type: AlertType.SUCCESS,
            icon: 'done'
        },
        noAuthorizationOrActivation: {
            message: 'Nicht authorisiert oder nicht aktiviert. '
                + 'Wenn bereits registriert, überprüfen Sie bitte Ihre Email auf einen Aktivierungslink',
            type: AlertType.ERROR

        },
        sendCancel: {
            message: 'Es wurden keine Probendaten an das BfR gesendet',
            type: AlertType.ERROR

        },
        validationFailure: {
            message: 'Es gab einen Fehler beim Validieren.',
            type: AlertType.ERROR

        },
        uploadFailure: {
            message: 'Es gab einen Fehler beim Importieren der Datei.',
            type: AlertType.ERROR

        },
        sendFailure: {
            message: 'Es gab einen Fehler beim Versenden der Datei and das MiBi-Portal.',
            type: AlertType.ERROR

        },
        sendSuccess: {
            type: AlertType.SUCCESS,
            message: `Der Auftrag wurde an das BfR gesendet.
            Bitte drucken Sie die Exceltabelle in Ihrem Mailanhang
            aus und legen sie Ihren Isolaten bei.`

        },
        validationErrors: {
            message: 'Es gibt noch rot gekennzeichnete Fehler. Bitte vor dem Senden korrigieren.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getConfigOfType(UserActionType.SEND), ...{ label: 'Nochmals Senden' } }

        },

        autocorrections: {
            message: 'Es wurden Felder autokorregiert. Bitte prüfen und nochmals senden.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getConfigOfType(UserActionType.SEND), ...{ label: 'Nochmals Senden' } }

        },
        wrongUploadDatatype: {
            type: AlertType.ERROR,
            message: 'Falscher Dateityp: Dateien müssen vom Typ .xlsx sein.'

        },
        wrongUploadFilesize: {
            type: AlertType.ERROR,
            message: 'Zu grosse Datei: Dateien müssen kleiner als 2 Mb sein.'

        },
        accountActivationSuccess: {
            message: 'Kontoaktivierung erfolgreich!',
            type: AlertType.SUCCESS

        },
        accountActivationFailure: {
            message: 'Unable to activate account.',
            type: AlertType.ERROR

        },
        passwordChangeSuccess: {
            message: 'Bitte melden Sie sich mit Ihrem neuen Passwort an',
            type: AlertType.SUCCESS,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/login'), ...{ label: 'Zum Login' } }

        },
        passwordChangeFailure: {
            // tslint:disable-next-line:max-line-length
            message: `Fehler beim Passwort zurücksetzten, Token ungültig. Bitte lassen Sie sich einen neuen 'Passwort-Reset' Link mit Hilfe der Option 'Passwort vergessen?' zuschicken.`,
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/recovery'), ...{ label: 'Zum Passwort-Reset' } }

        },
        loginFailure: {
            // tslint:disable-next-line:max-line-length
            message: 'Es gab einen Fehler beim einloggen.  Bitte registrieren Sie sich oder, wenn Sie sich schon registriert haben, kontaktieren Sie das MiBi-Portal team.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/register'), ...{ label: 'Zur Registrierung' } }

        },
        loginUnauthorized: {
            message: 'Nicht authorisiert, bitte einloggen.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/login'), ...{ label: 'Zum Login' } }
        },
        exportFailure: {
            message: 'Es gab einen Fehler beim Exportieren der Datei.',
            type: AlertType.ERROR
        }
    };

    banner$: Observable<Banner | null>;
    constructor(private store: Store<fromCore.State>, private userActionService: UserActionService) { }

    ngOnInit() {
        this.banner$ = this.store.pipe(select(fromCore.getBanner),
            map(b => {
                if (b) {
                    const banner = this.banners[b.predefined] || b.custom;
                    if (banner) {
                        if (!banner.mainAction) {
                            banner.mainAction = this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER);
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
                        if (banner.mainAction && !(banner.mainAction.type === UserActionType.DISMISS_BANNER)) {
                            this.userActionService.augmentOnClick(banner.mainAction,
                                this.userActionService.getOnClickHandlerOfType(UserActionType.DISMISS_BANNER));
                        }
                        if (banner.auxilliaryAction && !(banner.auxilliaryAction.type === UserActionType.DISMISS_BANNER)) {
                            this.userActionService.augmentOnClick(banner.auxilliaryAction,
                                this.userActionService.getOnClickHandlerOfType(UserActionType.DISMISS_BANNER));
                        }
                        return banner;
                    }
                }
                return null;
            }));
    }
}
