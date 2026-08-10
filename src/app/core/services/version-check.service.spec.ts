import { HttpBackend, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DialogService } from '../../shared/dialog/dialog.service';
import { SystemInformationResponseDTO } from '../model/response.model';
import { VersionCheckService } from './version-check.service';

function systemInfo(clientVersion?: string): SystemInformationResponseDTO {
    return {
        version: '6.0.0',
        lastChange: '2026-01-01 00:00:00 +0100',
        supportContact: 'support@example.com',
        clientVersion: clientVersion
    };
}

function makeService(
    respond = jest.fn().mockReturnValue(of(new HttpResponse({ body: systemInfo() })))
): {
    service: VersionCheckService;
    respond: jest.Mock;
    openDialog: jest.Mock;
    reloadPage: jest.SpyInstance;
    closeDialog: () => void;
} {
    const backend = { handle: respond } as unknown as HttpBackend;
    let close = () => { /* replaced once the dialog is opened */ };
    const openDialog = jest.fn().mockImplementation(() => ({
        // Nothing closes the dialog until the test says so.
        afterClosed: () => ({
            subscribe: (next: () => void) => {
                close = next;
                return { unsubscribe: () => {} };
            }
        })
    }) as unknown as MatDialogRef<unknown>);
    const dialogService = { openDialog: openDialog } as unknown as DialogService;
    const service = new VersionCheckService(backend, dialogService);
    const reloadPage = jest.spyOn(service as any, 'reloadPage').mockImplementation(() => {});
    return {
        service: service,
        respond: respond,
        openDialog: openDialog,
        reloadPage: reloadPage,
        closeDialog: () => close()
    };
}

describe('VersionCheckService', () => {

    beforeEach(() => {
        localStorage.setItem('currentUser', '{"token":"abc"}');
        sessionStorage.setItem('draft', 'sample data');
    });

    it('passes when the deployed client version matches this client', async () => {
        const respond = jest.fn().mockReturnValue(
            of(new HttpResponse({ body: systemInfo(environment.version) }))
        );
        const { service } = makeService(respond);

        await expect(service.ensureClientIsCurrent().toPromise()).resolves.toBe(true);
    });

    it('passes when the server reports no deployed client version', async () => {
        const { service } = makeService();

        await expect(service.ensureClientIsCurrent().toPromise()).resolves.toBe(true);
    });

    it('passes when the version request fails, so a hiccup is no lockout', async () => {
        const respond = jest.fn().mockReturnValue(
            throwError(() => new HttpErrorResponse({ status: 500 }))
        );
        const { service } = makeService(respond);

        await expect(service.ensureClientIsCurrent().toPromise()).resolves.toBe(true);
    });

    describe('with an outdated client', () => {
        // A fresh mock per test: call counts are asserted below.
        const outdated = () => jest.fn().mockReturnValue(
            of(new HttpResponse({ body: systemInfo('999.0.0') }))
        );

        it('blocks further communication', async () => {
            const { service } = makeService(outdated());

            await expect(service.ensureClientIsCurrent().toPromise()).resolves.toBe(false);
        });

        it('invalidates the locally stored data', async () => {
            const { service } = makeService(outdated());

            await service.ensureClientIsCurrent().toPromise();

            expect(localStorage.getItem('currentUser')).toBeNull();
            expect(sessionStorage.getItem('draft')).toBeNull();
        });

        it('opens a dialog the user cannot dismiss', async () => {
            const { service, openDialog } = makeService(outdated());

            await service.ensureClientIsCurrent().toPromise();

            expect(openDialog).toHaveBeenCalledTimes(1);
            expect(openDialog.mock.calls[0][1]).toEqual(
                expect.objectContaining({ disableClose: true })
            );
        });

        it('reloads the page once the dialog is closed', async () => {
            const { service, reloadPage, closeDialog } = makeService(outdated());

            await service.ensureClientIsCurrent().toPromise();
            expect(reloadPage).not.toHaveBeenCalled();

            closeDialog();

            expect(reloadPage).toHaveBeenCalledTimes(1);
        });

        it('keeps blocking without asking the server again', async () => {
            const { service, respond } = makeService(outdated());

            await service.ensureClientIsCurrent().toPromise();
            await expect(service.ensureClientIsCurrent().toPromise()).resolves.toBe(false);

            expect(respond).toHaveBeenCalledTimes(1);
        });
    });

    it('does not ask the server again right after a successful check', async () => {
        const { service, respond } = makeService();

        await service.ensureClientIsCurrent().toPromise();
        await service.ensureClientIsCurrent().toPromise();

        expect(respond).toHaveBeenCalledTimes(1);
    });
});
