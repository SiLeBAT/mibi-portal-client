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

const PORTAL_WARNING_COMMENT_PREFIX = 'Warnung vom MiBi-Portal: ';

export const sendSamplesDialogStrings = {
    PORTAL_ALREADY_SENT_COMMENT: PORTAL_WARNING_COMMENT_PREFIX
    + 'Der Einsendebogen wurde vom Benutzer in der selben Browser-Session bereits gesendet.',
    ALREADY_SENT_WARNING_PRE: 'Sie haben den Einsendebogen:\n"',
    ALREADY_SENT_WARNING_POST: '" bereits gesendet. Wollen Sie die Daten wirklich nochmal senden?',
    REGARDLESS_BUTTON_LABEL: 'Trotzdem senden'
};
