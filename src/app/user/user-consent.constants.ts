export const userConsentDialogStrings = {
    title: 'Neue Funktionalität verfügbar',
    introductoryText:
        'Das BfR bietet zukünftig an, Analyseergebnisse der BfR-Labore über das ' +
        'MiBi-Portal als CSV-Datei zum Download bereitzustellen. Hierzu ist das ' +
        'Speichern der hochgeladenen und ans BfR gesandten Untersuchungsaufträge ' +
        'erforderlich. Bisher hat das MiBi-Portal Ihre Daten nur weitergeleitet ' +
        'und auf dem Server nichts gespeichert.',
    agreeChoice:
        'Für das Speichern meiner Isolatdaten und das Speichern der ' +
        'BfR-Analyseergebnisse im MiBi-Portal gebe ich hiermit meine Einwilligung.',
    disagreeChoice: 'Ich willige nicht ein.',
    concludingText:
        'Die Entscheidung für oder gegen das Speichern der Daten im MiBi-Portal ' +
        'kann jederzeit auf der Profilseite geändert werden.',
    saveButtonLabel: 'Speichern'
};

export const userConsentProfileStrings = {
    boxTitle: 'Speicherung von Isolatdaten und Analyseergebnissen',
    // Per the ticket, reuse the official consent texts (not the mockup drafts).
    introductoryText: userConsentDialogStrings.introductoryText,
    consentCheckboxLabel: userConsentDialogStrings.agreeChoice
};

export const userConsentWithdrawStrings = {
    title: 'Einwilligung zur Speicherung der Daten zurückziehen',
    text:
        'Es werden keine neuen Daten mehr im MiBi-Portal gespeichert. Es werden ' +
        'keine E-Mail-Benachrichtigungen über vorhandene BfR-Analyseergebnisse ' +
        'mehr versendet.',
    deletionWarning:
        'Alle hochgeladenen Daten, die in der Tabelle "Ihre bisherigen Aufträge ' +
        'ans BfR" aufgelistet sind, werden nun gelöscht.',
    confirmPrompt: 'Bitte bestätigen Sie:',
    confirmInstruction: 'Schreiben Sie "delete", um alle Aufträge zu löschen.',
    // The word the user must type to arm the withdraw button (case-sensitive).
    confirmToken: 'delete',
    backButtonLabel: 'Zurück',
    withdrawButtonLabel: 'Einwilligung zurückziehen'
};
