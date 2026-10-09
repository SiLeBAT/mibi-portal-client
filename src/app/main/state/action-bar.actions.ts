import { createAction, props } from '@ngrx/store';
import { ActionBarItem, ActionBarItemId } from '../action-bar/action-bar.model';

// Configuration: dispatched by the feature that owns the current page.
export const configureActionBarSOA = createAction(
    '[Main/ActionBar] Configure action bar',
    props<{ title: string; items: ActionBarItem[] }>()
);

export const updateActionBarTitleSOA = createAction(
    '[Main/ActionBar] Update action bar title',
    props<{ title: string }>()
);

export const hideActionBarSOA = createAction('[Main/ActionBar] Hide action bar');

// Usage: dispatched by the action bar, consumed by the owning feature's effects.
export const actionBarItemClickedMSA = createAction(
    '[Main/ActionBar] Action bar item clicked',
    props<{ id: ActionBarItemId }>()
);

export const actionBarFileSelectedMSA = createAction(
    '[Main/ActionBar] File selected for action bar item',
    props<{ id: ActionBarItemId; file: File }>()
);

export const actionBarMenuEntrySelectedMSA = createAction(
    '[Main/ActionBar] Menu entry selected for action bar item',
    props<{ id: ActionBarItemId; entryId: string }>()
);
