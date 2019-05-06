import { CommentDialogConfiguration } from '../../comment-dialog/model/comment-dialog-config.model';

export const sendSamplesDefaultDialogConfiguration: CommentDialogConfiguration = {
    title: 'Senden',
    message: 'Ihre Probendaten werden jetzt an das BfR gesendet.'
        + ' Bitte vergessen Sie nicht die Exceltabelle in Ihrem Mailanhang auszudrucken und Ihren Isolaten beizulegen.',
    warnings: [],
    commentTitle: 'Kommentar für das NRL',
    confirmButtonConfig: {
        label: 'Senden'
    },
    cancelButtonConfig: {
        label: 'Abbrechen'
    }
};

export const SEND_SAMPLES_ALREADY_SENT_WARNING: string =
    'Sie haben diesen Einsendebogen bereits gesendet. Wollen Sie die Daten wirklich nochmal senden?';

export const SEND_SAMPLES_REGARDLESS_BUTTON_LABEL: string = 'Trotzdem senden';

export const SEND_SAMPLES_ALREADY_SENT_COMMENT = 'ACHTUNG: Geänderte Daten zu vorherigem Auftrag';
