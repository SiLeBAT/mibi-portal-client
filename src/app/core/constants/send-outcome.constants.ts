// Wording for the ways a submission can end. Kept here rather than in the
// samples module because the banner catalogue in core renders the fixed
// messages and the send effects render the one that needs the phone number the
// server sent back.

// SERVER_ERROR_CODE.ORDER_SUBMISSION_FAILED in the cloud code: the order was
// validated and saved, and the mail to the NRLs is what failed. The other
// failure codes (saving, unknown) are not mail problems and must not claim to
// be one.
export const MAIL_DELIVERY_FAILED_CODE = 10;

export const sendOutcomeStrings = {
    // The mail system itself is the problem, so the sender is pointed at the
    // one channel that still works. Used only when a number is configured -
    // without one the sentence would end on a dangling colon.
    mailSystemDown: (phone: string) =>
        'Das Versenden von E-Mails ist zur Zeit gestört.'
        + ` Bitte rufen Sie die für das MiBi-Portal verantwortliche Person an: ${phone}`,

    // Fallback for every other way a send can fail: no phone configured, or the
    // request failed for a reason that has nothing to do with mail.
    nothingSent: 'Es wurde keine E-Mail ans BfR gesendet. Bitte versuchen Sie es später noch einmal.',

    // The NRLs have the data, only the sender's own copy was lost. Their copy is
    // the Probenbegleitschein they print and attach to their isolates, so they
    // are pointed at the file they uploaded as a stand-in.
    noCustomerCopy: 'Ihre Daten wurden ans BfR gesandt. Leider konnte das System keine E-Mail an Sie versenden.'
        + ' Bitte drucken Sie ausnahmsweise die hochgeladene Excel-Datei als Probenbegleitschein aus.'
};
