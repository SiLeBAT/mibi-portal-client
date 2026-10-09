/**
 * A button placed by a banner or a dialog.
 *
 * These carry a callback because they act in the context that raised them. The
 * action bar does not use this model: its items are declared as data by the
 * feature that owns the page (see main/action-bar/action-bar.model).
 */
export interface UserActionViewModelConfiguration {
    label: string;
    // Invoked with no arguments by the banner and dialog components. The
    // action bar used to push its $event through here, which is why this was
    // previously widened to accept any argument; it no longer does.
    onExecute: () => void;
    type: UserActionType;
    icon?: string;
    focused?: boolean;
}

export enum UserActionType {
    SEND, DISMISS_BANNER, NAVIGATE, CUSTOM
}
