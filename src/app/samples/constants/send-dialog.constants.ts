import { SendDialogConfiguration } from '../model/send-dialog.model';

export const SENDDIALOGCONFIG: SendDialogConfiguration = {
    title: 'Senden',
    message: 'Ihre Probendaten werden jetzt an das BfR gesendet.'
    + ' Bitte vergessen Sie nicht die Exceltabelle in Ihrem Mailanhang auszudrucken und Ihren Isolaten beizulegen.',
    commentMessage : 'Kommentar für das NRL',
    confirmButtonConfig: {
        label: 'Senden'
    },
    cancelButtonConfig: {
        label: 'Abbrechen'
    }
};
