import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../../environments/environment';
import { SystemInformationResponseDTO } from '../model/response.model';
import {
    NewClientVersionDialogComponent
} from '../presentation/new-client-version-dialog/new-client-version-dialog.component';
import { VersionCheckInterceptor } from './version-check-interceptor.service';
import { VersionCheckService } from './version-check.service';

/**
 * Drives the whole chain the way the app wires it up: a real HttpClient, the
 * interceptor registered as HTTP_INTERCEPTORS, and the real dialog component.
 */
function systemInfo(clientVersion: string): SystemInformationResponseDTO {
    return {
        version: '6.0.0',
        lastChange: '2026-01-01 00:00:00 +0100',
        supportContact: 'support@example.com',
        clientVersion: clientVersion
    };
}

describe('VersionCheckInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let dialog: MatDialog;
    let reloadPage: jest.SpyInstance;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule, NoopAnimationsModule],
            declarations: [NewClientVersionDialogComponent],
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: VersionCheckInterceptor,
                    multi: true
                }
            ]
        });
        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        dialog = TestBed.inject(MatDialog);
        reloadPage = jest
            .spyOn(TestBed.inject(VersionCheckService) as any, 'reloadPage')
            .mockImplementation(() => {});
        localStorage.setItem('currentUser', '{"token":"abc"}');
    });

    afterEach(() => {
        dialog.closeAll();
        httpMock.verify();
    });

    it('checks the version before it lets an API request through', () => {
        const response = jest.fn();
        httpClient.get('v2/samples').subscribe(response);

        // The API request is held back until the version check answers.
        httpMock.expectNone('v2/samples');
        httpMock.expectOne('/v2/info').flush(systemInfo(environment.version));

        httpMock.expectOne('v2/samples').flush({ ok: true });
        expect(response).toHaveBeenCalledWith({ ok: true });
    });

    it('does not check the version for non-API requests', () => {
        httpClient.get('./assets/faq.json').subscribe();

        httpMock.expectNone('/v2/info');
        httpMock.expectOne('./assets/faq.json').flush({});
    });

    describe('when the server serves a different client version', () => {

        beforeEach(() => {
            httpClient.get('v2/samples').subscribe();
            httpMock.expectOne('/v2/info').flush(systemInfo('999.0.0'));
        });

        it('never sends the request', () => {
            httpMock.expectNone('v2/samples');
        });

        it('blocks the user with the reload dialog', () => {
            expect(dialog.openDialogs.length).toBe(1);
            expect(dialog.openDialogs[0].componentInstance)
                .toBeInstanceOf(NewClientVersionDialogComponent);
            expect(dialog.openDialogs[0].disableClose).toBe(true);
        });

        it('invalidates the locally stored data', () => {
            expect(localStorage.getItem('currentUser')).toBeNull();
        });

        // The dialog closes asynchronously, so afterClosed only fires once the
        // pending tasks have run.
        it('reloads the page when the user confirms', fakeAsync(() => {
            const dialogRef = dialog.openDialogs[0];
            (dialogRef.componentInstance as NewClientVersionDialogComponent).onReload();
            flush();

            expect(reloadPage).toHaveBeenCalledTimes(1);
        }));

        it('blocks every later API request without asking again', () => {
            httpClient.get('v2/orders').subscribe();

            httpMock.expectNone('v2/orders');
            httpMock.expectNone('/v2/info');
        });
    });
});
