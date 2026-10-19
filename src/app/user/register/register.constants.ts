export const userRegisterStrings = {
    success: (email: string) =>
        'Bitte bestätigen Sie Ihre E-Mail-Adresse: Eine E-mail mit weiteren '
        + `Anweisungen wurde an ${email} gesendet`,
    failure: (email: string, supportContact: string) =>
        `Fehler beim Registrieren. Eine E-mail mit weiteren Informationen wurde an ${email} gesendet. `
        + 'Wenn Sie keine E-mail erhalten, wenden Sie sich bitte direkt per '
        + `E-mail an uns: ${supportContact}.`
};
