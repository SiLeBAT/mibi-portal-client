export const userRecoverPasswordStrings = {
    success: (email: string) =>
        `Eine E-mail mit weiteren Anweisungen wurde an ${email} gesendet. `
        + 'Wenn Sie keine E-mail erhalten, könnte das bedeuten, daß Sie sich '
        + 'mit einer anderen E-mail-Adresse angemeldet haben.',
    failure: (email: string, supportContact: string) =>
        `Fehler beim Passwort-Zurücksetzen. Eine E-mail mit weiteren Informationen wurde an ${email} gesendet. `
        + 'Wenn Sie keine E-mail erhalten, wenden Sie sich bitte direkt per '
        + `E-mail an uns: ${supportContact}.`
};
