import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { EMPTY, Observable, combineLatest } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { downloadZomoPlanFileActionBarItem } from '../core/download-zomo-plan-file/download-zomo-plan-file.action-bar';
import { CoreMainSlice } from '../core/core.state';
import { selectZomoPlanFiles } from '../core/state/core.selectors';
import { ActionBarItem } from '../main/action-bar/action-bar.model';
import { actionBarFileSelectedMSA, actionBarItemClickedMSA, configureActionBarSOA } from '../main/state/action-bar.actions';
import { UserMainSlice } from '../user/user.state';
import { selectUserCurrentUser } from '../user/state/user.selectors';
import { closeSamplesSSA } from './close-samples/close-samples.actions';
import { exportSamplesSSA } from './export-samples/export-samples.actions';
import { importSamplesMSA } from './import-samples/import-samples.actions';
import { samplesActionBarItemIds, samplesEditorActionBarItems, samplesUploadActionBarItems } from './samples-action-bar.items';
import { samplesPaths } from './samples.paths';
import { SamplesMainSlice } from './samples.state';
import { sendSamplesSSA } from './send-samples/state/send-samples.actions';
import { selectHasEntries, selectImportedFileName } from './state/samples.selectors';
import { validateSamplesSSA } from './validate-samples/validate-samples.actions';

/**
 * Owns the action bar while a samples page is open: it declares the items the
 * page offers, and turns a used item back into the matching samples action.
 */
@Injectable()
export class SamplesActionBarEffects {

    /**
     * One stream per navigation, so the configuration of a page we have left
     * can never overwrite the configuration of the page we are on.
     */
    configureActionBar$ = createEffect(() => this.actions$.pipe(
        ofType(routerNavigatedAction),
        map(action => action.payload.event.urlAfterRedirects),
        switchMap(url => {
            if (url.includes(samplesPaths.editor)) {
                return this.editorActionBar$();
            }
            if (url.includes(samplesPaths.upload)) {
                return this.uploadActionBar$();
            }
            // Not a samples page: its own feature configures the bar.
            return EMPTY;
        })
    ));

    runUsedItem$ = createEffect(() => this.actions$.pipe(
        ofType(actionBarItemClickedMSA),
        map(action => this.actionFor(action.id)),
        filter(action => action !== undefined)
    ));

    /** The Excel template is a static file, so this opens it directly. */
    downloadTemplate$ = createEffect(() => this.actions$.pipe(
        ofType(actionBarItemClickedMSA),
        filter(action => action.id === samplesActionBarItemIds.downloadTemplate),
        tap(() => window.open(environment.sampleSheetURL, '_blank'))
    ), { dispatch: false });

    importSelectedFile$ = createEffect(() => this.actions$.pipe(
        ofType(actionBarFileSelectedMSA),
        filter(action => action.id === samplesActionBarItemIds.upload),
        map(action => importSamplesMSA({ excelFile: { file: action.file } }))
    ));

    constructor(
        private actions$: Actions,
        private store$: Store<SamplesMainSlice & CoreMainSlice & UserMainSlice>
    ) {}

    private actionFor(id: string): Action | undefined {
        switch (id) {
            case samplesActionBarItemIds.validate:
                return validateSamplesSSA();
            case samplesActionBarItemIds.export:
                return exportSamplesSSA();
            case samplesActionBarItemIds.send:
                return sendSamplesSSA();
            case samplesActionBarItemIds.close:
                return closeSamplesSSA();
            default:
                return undefined;
        }
    }

    /**
     * The upload page offers only the entry points, but it can be reached with
     * samples still loaded, so the upload item has to know that.
     */
    private uploadActionBar$(): Observable<Action> {
        return this.store$.select(selectHasEntries).pipe(
            switchMap(hasEntries =>
                this.withZomoPlanItem(samplesUploadActionBarItems(hasEntries)).pipe(
                    map(items => configureActionBarSOA({ title: '', items: items }))
                )
            )
        );
    }

    /**
     * The editor's items depend on what is loaded and on the user, so the bar
     * is reconfigured whenever any of that changes.
     */
    private editorActionBar$(): Observable<Action> {
        return combineLatest([
            this.store$.select(selectHasEntries),
            this.store$.select(selectUserCurrentUser),
            this.store$.select(selectImportedFileName)
        ]).pipe(
            switchMap(([hasEntries, currentUser, fileName]) =>
                this.withZomoPlanItem(
                    samplesEditorActionBarItems(hasEntries, !!currentUser)
                ).pipe(
                    map(items => configureActionBarSOA({ title: fileName, items: items }))
                )
            )
        );
    }

    /**
     * The ZoMo-plan download is offered on both samples pages, but only to a
     * logged-in user. The item itself is defined by the feature that performs
     * the download.
     */
    private withZomoPlanItem(items: ActionBarItem[]): Observable<ActionBarItem[]> {
        return combineLatest([
            this.store$.select(selectUserCurrentUser),
            this.store$.select(selectZomoPlanFiles)
        ]).pipe(
            map(([currentUser, zomoPlanFiles]) => currentUser
                ? [...items, downloadZomoPlanFileActionBarItem(zomoPlanFiles)]
                : items
            )
        );
    }
}
