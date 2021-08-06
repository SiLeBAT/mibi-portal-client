import { DialogConfiguration } from '../../shared/dialog/dialog.model';

export const closeSamplesConfirmDialogConfiguration: DialogConfiguration = {
    title: 'Schließen',
    message: 'Wenn Sie die Tabelle schließen, gehen Ihre Änderungen verloren. Wollen Sie das?',
    warnings: [],
    confirmButtonConfig: {
        label: 'Ok'
    },
    cancelButtonConfig: {
        label: 'Abbrechen'
    }
};
