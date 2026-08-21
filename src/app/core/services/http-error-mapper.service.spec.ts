import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ClientError, EndpointError } from '../model/client-error';
import { HttpErrorMapperService } from './http-error-mapper.service';

const intercept = async (body: unknown): Promise<unknown> => {
    const response = new HttpErrorResponse({ status: 422, error: body });
    const next = { handle: () => throwError(() => response) };

    return new Promise(resolve =>
        new HttpErrorMapperService()
            .intercept({} as never, next as never)
            .subscribe({ error: (error: unknown) => resolve(error) })
    );
};

describe('HttpErrorMapperService', () => {
    it('keeps the response body for a failed submission', async () => {
        // Code 10 is ORDER_SUBMISSION_FAILED. The body carries the support
        // phone number, which is lost if this is not an EndpointError.
        const error = await intercept({
            code: 10,
            message: 'submission failed',
            supportPhone: '030 18412-0'
        });

        expect(error).toBeInstanceOf(EndpointError);
        expect((error as EndpointError).errorDTO.supportPhone).toBe('030 18412-0');
    });

    it('keeps the response body for a failed save', async () => {
        const error = await intercept({ code: 9, message: 'saving failed' });

        expect(error).toBeInstanceOf(EndpointError);
    });

    it('still keeps the body for validation errors', async () => {
        const error = await intercept({ code: 5, message: 'invalid', order: {} });

        expect(error).toBeInstanceOf(EndpointError);
    });

    it('falls back to a plain client error for unmapped codes', async () => {
        const error = await intercept({ code: 99, message: 'something else' });

        expect(error).toBeInstanceOf(ClientError);
        expect(error).not.toBeInstanceOf(EndpointError);
    });
});
