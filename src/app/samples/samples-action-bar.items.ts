import { ActionBarItem } from '../main/action-bar/action-bar.model';
import { closeSamplesConfirmDialogStrings } from './close-samples/close-samples.constants';

/**
 * The action bar items the samples feature contributes, and the ids it
 * recognises when one of them is used. Ids are namespaced so that two features
 * contributing to the same bar cannot collide.
 */
export const samplesActionBarItemIds = {
    validate: 'samples/validate',
    upload: 'samples/upload',
    export: 'samples/export',
    send: 'samples/send',
    close: 'samples/close',
    downloadTemplate: 'samples/downloadTemplate'
} as const;

const validate: ActionBarItem = {
    kind: 'button',
    id: samplesActionBarItemIds.validate,
    label: 'Validieren',
    icon: 'spellcheck'
};

/**
 * Uploading replaces whatever is loaded, so the item asks for confirmation
 * when there is something to lose. Deciding that here keeps the upload
 * component free of any knowledge about samples.
 */
function uploadItem(hasEntries: boolean): ActionBarItem {
    return {
        kind: 'upload',
        id: samplesActionBarItemIds.upload,
        label: 'Hochladen',
        icon: 'publish',
        confirmMessage: hasEntries
            ? closeSamplesConfirmDialogStrings.message
            : undefined
    };
}

const exportSamples: ActionBarItem = {
    kind: 'button',
    id: samplesActionBarItemIds.export,
    label: 'Exportieren',
    icon: 'file_copy'
};

const send: ActionBarItem = {
    kind: 'button',
    id: samplesActionBarItemIds.send,
    label: 'Senden',
    icon: 'send'
};

const close: ActionBarItem = {
    kind: 'button',
    id: samplesActionBarItemIds.close,
    label: 'Schließen',
    icon: 'clear'
};

const downloadTemplate: ActionBarItem = {
    kind: 'button',
    id: samplesActionBarItemIds.downloadTemplate,
    label: 'Excel-Vorlage',
    icon: 'assignment_returned'
};

/** Upload page: only the entry points, since no editor is open. */
export function samplesUploadActionBarItems(hasEntries: boolean): ActionBarItem[] {
    return [uploadItem(hasEntries), downloadTemplate];
}

/**
 * Editor page. SEND, VALIDATE, EXPORT and CLOSE act on loaded samples, so they
 * only appear once there are entries; SEND additionally needs a logged-in user.
 */
export function samplesEditorActionBarItems(
    hasEntries: boolean,
    isLoggedIn: boolean
): ActionBarItem[] {
    const items: ActionBarItem[] = [];
    if (hasEntries) {
        if (isLoggedIn) {
            items.push(send);
        }
        items.push(validate, exportSamples, close);
    }
    items.push(uploadItem(hasEntries), downloadTemplate);
    return items;
}
