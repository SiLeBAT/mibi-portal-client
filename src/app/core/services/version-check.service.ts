import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DialogService } from '../../shared/dialog/dialog.service';
import { SystemInformationResponseDTO } from '../model/response.model';
import {
    NewClientVersionDialogComponent
} from '../presentation/new-client-version-dialog/new-client-version-dialog.component';

/**
 * Guards against a browser tab that stays open across a client release.
 *
 * Such a tab keeps running the bundle it originally loaded and would talk to an
 * API it no longer matches, which can corrupt data. Before the client talks to
 * the server (see VersionCheckInterceptor) the version baked into this bundle
 * is compared against the version the server currently serves. On a mismatch
 * the locally stored data is discarded and the user is forced to reload.
 *
 * Two versions are compared, and they reach this service on very different
 * paths:
 *
 * 1. `environment.version` - the version of the bundle this tab is running.
 *    default.environment.ts imports package.json and Angular compiles the value
 *    into the JavaScript at build time, so it is frozen at whatever the release
 *    was and travels with the tab. It never changes while the tab is open, and
 *    that is the whole point: it identifies the code the user is looking at.
 *
 * 2. `systemInfo.clientVersion` - the version of the bundle currently deployed.
 *    The client build writes it to assets/version.json (scripts/write-version.js),
 *    that file is deployed into the server's public directory, the server reads
 *    it at startup (client-version.ts in mibi-portal-server) and returns it from
 *    GET /v2/info. So it always describes the release a fresh page load would
 *    get right now.
 *
 * Equal means the tab is running what the server serves. Different means a
 * release happened after this tab loaded its bundle. There is no version
 * comparison ("newer"/"older"), only equality: any deviation is a mismatch.
 */
@Injectable({
    providedIn: 'root'
})
export class VersionCheckService {

    // Asking the server on literally every request would add a round trip to
    // each of them. A release does not have to be noticed within seconds.
    private static readonly MIN_CHECK_INTERVAL_MS = 60_000;

    private static readonly SYSTEM_INFO_URL = '/v2/info';

    private readonly httpClient: HttpClient;
    private lastCheck = 0;
    private clientIsCurrent = true;
    private pendingCheck: Observable<boolean> | null = null;

    constructor(handler: HttpBackend, private dialogService: DialogService) {
        // Bypasses the interceptor chain on purpose: the version check request
        // must not be held up by the version check itself.
        this.httpClient = new HttpClient(handler);
    }

    /**
     * Emits whether this client may still talk to the server. Concurrent
     * callers share one request, and a recent result is reused.
     */
    ensureClientIsCurrent(): Observable<boolean> {
        if (!this.clientIsCurrent) {
            return of(false);
        }
        if (this.pendingCheck) {
            return this.pendingCheck;
        }
        if (Date.now() - this.lastCheck < VersionCheckService.MIN_CHECK_INTERVAL_MS) {
            return of(true);
        }

        this.pendingCheck = this.httpClient
            .get<SystemInformationResponseDTO>(VersionCheckService.SYSTEM_INFO_URL)
            .pipe(
                map(systemInfo => this.evaluate(systemInfo.clientVersion)),
                // An unreachable or failing server is not an outdated client;
                // blocking the app here would turn a hiccup into a lockout.
                catchError(() => of(true)),
                finalize(() => {
                    this.lastCheck = Date.now();
                    this.pendingCheck = null;
                }),
                shareReplay({ bufferSize: 1, refCount: false })
            );

        return this.pendingCheck;
    }

    private evaluate(deployedVersion: string | undefined): boolean {
        // Unknown on the server side: no client bundle is deployed next to it
        // (development) or it predates the field. Nothing to compare against.
        if (!deployedVersion) {
            return true;
        }
        if (deployedVersion === environment.version) {
            return true;
        }

        this.clientIsCurrent = false;
        this.invalidateLocalData();
        this.forceReload();
        return false;
    }

    /**
     * Everything the user entered lives in the in-memory NgRx store and is
     * dropped by the reload anyway. The persisted session has to go explicitly:
     * it may not match what the new release expects.
     */
    private invalidateLocalData(): void {
        localStorage.clear();
        sessionStorage.clear();
    }

    private forceReload(): void {
        const dialogRef = this.dialogService.openDialog(
            NewClientVersionDialogComponent,
            {
                // The dialog is the only way forward, so it must not be
                // dismissable by clicking the backdrop or pressing escape.
                disableClose: true,
                width: '40em'
            }
        );
        dialogRef.afterClosed().subscribe(() => this.reloadPage());
    }

    private reloadPage(): void {
        window.location.reload();
    }
}
