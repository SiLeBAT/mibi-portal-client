import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MainMainSlice } from '../main.state';
import {
    actionBarFileSelectedMSA,
    actionBarItemClickedMSA,
    actionBarMenuEntrySelectedMSA
} from '../state/action-bar.actions';
import {
    selectActionBarItems,
    selectActionBarTitle
} from '../state/action-bar.selectors';
import {
    ActionBarItem,
    ActionBarItemId,
    ActionBarMenuEntry
} from './action-bar.model';

/**
 * Renders the configured action bar and reports what the user did.
 *
 * The bar knows nothing about what any item does: it reads its configuration
 * from the store and dispatches the item's id back. The feature that configured
 * the bar decides what that means.
 */
@Component({
    standalone: false,
    selector: 'mibi-action-bar',
    templateUrl: './action-bar.component.html',
    styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent {

    title$: Observable<string> = this.store$.select(selectActionBarTitle);
    items$: Observable<ActionBarItem[]> = this.store$.select(selectActionBarItems);

    constructor(private store$: Store<MainMainSlice>) {}

    // Angular templates do not narrow a discriminated union, so the menu
    // entries are read through a helper instead of inside the switch.
    menuEntries(item: ActionBarItem): ActionBarMenuEntry[] {
        return item.kind === 'menu' ? item.entries : [];
    }

    confirmMessageOf(item: ActionBarItem): string | undefined {
        return item.kind === 'upload' ? item.confirmMessage : undefined;
    }

    onItemClicked(id: ActionBarItemId): void {
        this.store$.dispatch(actionBarItemClickedMSA({ id: id }));
    }

    onFileSelected(id: ActionBarItemId, file: File): void {
        this.store$.dispatch(actionBarFileSelectedMSA({ id: id, file: file }));
    }

    /**
     * A menu with a single entry is shown as a plain link. Resolving the entry
     * here keeps the undefined case out of the template, which cannot narrow
     * an index lookup.
     */
    onSingleMenuEntrySelected(item: ActionBarItem): void {
        const entry = this.menuEntries(item)[0];
        if (entry) {
            this.onMenuEntrySelected(item.id, entry.entryId);
        }
    }

    onMenuEntrySelected(id: ActionBarItemId, entryId: string): void {
        this.store$.dispatch(
            actionBarMenuEntrySelectedMSA({ id: id, entryId: entryId })
        );
    }
}
