import { DialogConfiguration } from '../../shared/dialog/dialog.model';

export const sendSamplesSendDialogConfiguration: DialogConfiguration = {
    title: 'Senden',
    message: 'Ihre Probendaten werden jetzt an das BfR gesendet.'
        + ' Bitte vergessen Sie nicht den Einsendebogen in Ihrem Mailanhang auszudrucken und Ihren Isolaten beizulegen.',
    warnings: [],
    confirmButtonConfig: {
        label: 'Senden'
    },
    cancelButtonConfig: {
        label: 'Abbrechen'
    }
};

export const sendSamplesSendDialogStrings = {
    commentWarningPreamble: 'Warnung vom MiBi-Portal: ',
    commentAlreadySent: 'Der Einsendebogen wurde vom Benutzer in der selben Browser-Session bereits gesendet.',
    warningAlreadySendPre: 'Sie haben den Einsendebogen:\n"',
    warningAlreadySendPost: '" bereits gesendet. Wollen Sie die Daten wirklich nochmal senden?',
    confirmWithWarningsLabel: 'Trotzdem senden'
};
