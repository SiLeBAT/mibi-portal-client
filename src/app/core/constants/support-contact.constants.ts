import { MailConfiguration } from '../model/mail.model';
import { environment } from '../../../environments/environment';

export const supportMailConfiguration: MailConfiguration = {
    recipient: environment.supportContact,
    subject: 'MiBi-Portal-Problem',
    body: 'Bitte schildern Sie uns Ihr Problem. '
        + 'Falls es Probleme mit einem hochgeladenen Probeneinsendebogen gab, hängen Sie diesen bitte an. '
        + 'Handelt es sich um ein Problem mit der Darstellung im MiBi-Portal, kann auch ein Screenshot hilfreich sein.'
};
