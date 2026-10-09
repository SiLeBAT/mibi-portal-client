/**
 * The action bar is configured by whichever feature owns the current page.
 *
 * Items carry only data -- an id, a label and an icon -- never behaviour. A
 * feature declares the items it wants, and reacts to the id when one is used.
 * That keeps the bar itself free of any knowledge about the features it serves.
 */

export type ActionBarItemId = string;

interface ActionBarItemBase {
    id: ActionBarItemId;
    label: string;
    icon?: string;
}

/** Plain action: using it reports the id and nothing else. */
export interface ActionBarButtonItem extends ActionBarItemBase {
    kind: 'button';
}

/** Opens a file chooser; using it reports the id together with the file. */
export interface ActionBarUploadItem extends ActionBarItemBase {
    kind: 'upload';
    /**
     * Shown for confirmation before the file chooser opens. The feature that
     * declares the item decides whether anything would be lost, so the bar and
     * the upload component need no knowledge of what is loaded.
     */
    confirmMessage?: string;
}

export interface ActionBarMenuEntry {
    entryId: string;
    label: string;
}

/**
 * Opens a menu; using it reports the id together with the chosen entry. With a
 * single entry the item behaves like a button, and with none it is inert.
 */
export interface ActionBarMenuItem extends ActionBarItemBase {
    kind: 'menu';
    entries: ActionBarMenuEntry[];
}

export type ActionBarItem =
    | ActionBarButtonItem
    | ActionBarUploadItem
    | ActionBarMenuItem;

export interface ActionBarConfig {
    isEnabled: boolean;
    title: string;
    items: ActionBarItem[];
}
