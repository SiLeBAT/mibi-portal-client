import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Banner, AlertType, BannerType } from '../../model/alert.model';
import { map } from 'rxjs/operators';
import { UserActionService } from '../../services/user-action.service';
import { UserActionType } from '../../../shared/model/user-action.model';
import { CoreMainSlice } from '../../core.state';
import { selectBannerData } from '../../state/core.selectors';
import { HideBannerSOA } from '../../state/core.actions';
import { BannerData } from '../../state/core.reducer';
import { Observable } from 'rxjs';
import { LogService } from '../../services/log.service';

@Component({
    selector: 'mibi-banner-container',
    template: `
        <mibi-banner *ngIf="(banner$ | async) as banner"
            [banner]="banner"
            (mainAction)="onMainAction(banner)"
            (auxilliaryAction)="onAuxAction(banner)"
        ></mibi-banner>`
})
export class BannerContainerComponent {

    readonly banner$: Observable<Banner | null>;

    private readonly banners: Record<BannerType, Banner> = {
        defaultError: {
            message: 'Ein Fehler ist aufgetreten.',

            type: AlertType.ERROR,
            icon: 'error',
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
        },
        defaultSuccess: {
            message: 'Operation erfolgreich durchgeführt.',

            type: AlertType.SUCCESS,
            icon: 'done',
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
        },
        noAuthorizationOrActivation: {
            message: 'Nicht authorisiert oder nicht aktiviert. '
                + 'Wenn bereits registriert, überprüfen Sie bitte Ihre Email auf einen Aktivierungslink',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        sendCancel: {
            message: 'Es wurden keine Probendaten an das BfR gesendet',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        validationFailure: {
            message: 'Es gab einen Fehler beim Validieren.',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        uploadFailure: {
            message: 'Es gab einen Fehler beim Importieren der Datei.',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        sendFailure: {
            message: 'Es gab einen Fehler beim Versenden der Datei an das MiBi-Portal.',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        sendSuccess: {
            type: AlertType.SUCCESS,
            message: `Der Auftrag wurde an das BfR gesendet.
            Bitte drucken Sie die Exceltabelle in Ihrem Mailanhang
            aus und legen sie Ihren Isolaten bei.`,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        validationErrors: {
            message: 'Es gibt noch rot gekennzeichnete Fehler. Bitte vor dem Senden korrigieren.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getConfigOfType(UserActionType.SEND), ...{ label: 'Nochmals Senden' } },
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },

        autocorrections: {
            message: 'Es wurden Felder autokorregiert. Bitte prüfen und nochmals senden.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getConfigOfType(UserActionType.SEND), ...{ label: 'Nochmals Senden' } },
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        wrongUploadDatatype: {
            type: AlertType.ERROR,
            message: 'Falscher Dateityp: Dateien müssen vom Typ .xlsx sein.',
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        wrongUploadFilesize: {
            type: AlertType.ERROR,
            message: 'Zu grosse Datei: Dateien müssen kleiner als 2 Mb sein.',
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        accountActivationSuccess: {
            message: 'Kontoaktivierung erfolgreich!',
            type: AlertType.SUCCESS,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        accountActivationFailure: {
            message: 'Kontoaktivierung fehlgeschlagen.  Bitte kontaktieren Sie das MiBi-Portal-Team.',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        passwordChangeSuccess: {
            message: 'Bitte melden Sie sich mit Ihrem neuen Passwort an',
            type: AlertType.SUCCESS,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/login'), ...{ label: 'Zum Login' } },
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        passwordChangeFailure: {
            // tslint:disable-next-line:max-line-length
            message: `Fehler beim Zurücksetzen des Passworts. Bitte klicken Sie im Bereich "Anmelden" auf "Passwort vergessen?" und lassen Sie sich einen neuen Link zum Zurücksetzen des Passworts zuschicken.`,
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/recovery'), ...{ label: 'Zum Passwort-Reset' } },
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        loginFailure: {
            // tslint:disable-next-line:max-line-length
            message: 'Es gab einen Fehler beim Einloggen.  Bitte registrieren Sie sich oder, wenn Sie sich schon registriert haben, kontaktieren Sie das MiBi-Portal-Team.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/register'), ...{ label: 'Zur Registrierung' } },
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        registrationFailure: {
            // tslint:disable-next-line:max-line-length
            message: 'Es gab einen Fehler beim Registrieren.  Bitte kontaktieren Sie das MiBi-Portal-Team.',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }

        },
        loginUnauthorized: {
            message: 'Nicht authorisiert, bitte einloggen.',
            type: AlertType.ERROR,
            auxilliaryAction: { ...this.userActionService.getNavigationConfig('/users/login'), ...{ label: 'Zum Login' } },
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
        },
        exportFailure: {
            message: 'Es gab einen Fehler beim Exportieren der Datei.',
            type: AlertType.ERROR,
            mainAction: { ...this.userActionService.getConfigOfType(UserActionType.DISMISS_BANNER) }
        }
    };

    constructor(
        private store$: Store<CoreMainSlice>,
        private userActionService: UserActionService,
        private logger: LogService
    ) {
        this.banner$ = this.store$.pipe(
            select(selectBannerData),
            map(bannerState => this.getBanner(bannerState))
        );
    }

    onMainAction(banner: Banner) {
        if (banner.mainAction) {
            banner.mainAction.onExecute();
        }
        this.store$.dispatch(new HideBannerSOA());
    }

    onAuxAction(banner: Banner) {
        if (banner.auxilliaryAction) {
            banner.auxilliaryAction.onExecute();
        }
        this.store$.dispatch(new HideBannerSOA());
    }

    private getBanner(bannerState: BannerData): Banner | null {
        let banner: Banner;

        if (bannerState.predefined) {
            banner = this.banners[bannerState.predefined];
        } else if (bannerState.custom) {
            banner = bannerState.custom;
        } else {
            return null;
        }

        if (!banner.icon) {
            switch (banner.type) {
                case AlertType.ERROR:
                    return { ...banner, icon: 'error' };
                case AlertType.SUCCESS:
                    return { ...banner, icon: 'done' };
                case AlertType.WARNING:
                default:
                    return { ...banner, icon: 'warning' };
            }
        }
        return banner;
    }
}
