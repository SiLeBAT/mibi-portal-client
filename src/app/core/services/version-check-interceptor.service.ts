import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NEVER, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { VersionCheckService } from './version-check.service';

/**
 * Runs the client version check before the client talks to the server, so an
 * outdated tab never reaches an API it no longer matches.
 */
@Injectable()
export class VersionCheckInterceptor implements HttpInterceptor {

    // Only the API contract can break between releases; static assets and the
    // proxied CMS are version agnostic.
    private static readonly API_URL_PATTERN = /(^|\/)v\d+\//;

    constructor(private versionCheck: VersionCheckService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!VersionCheckInterceptor.API_URL_PATTERN.test(req.url)) {
            return next.handle(req);
        }

        return this.versionCheck.ensureClientIsCurrent().pipe(
            // NEVER, not an error: the outdated client already shows its
            // blocking reload dialog and the page is about to go away. Letting
            // the request fail would only add an error banner behind it.
            switchMap(clientIsCurrent => clientIsCurrent ? next.handle(req) : NEVER)
        );
    }
}
