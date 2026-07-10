import { Injectable } from '@angular/core';
import { samplesPaths } from './samples.paths';

@Injectable({
    providedIn: 'root'
})
export class SamplesLinkProviderService {
    get upload(): string { return samplesPaths.upload; }
    get editor(): string { return samplesPaths.editor; }
    get results(): string { return samplesPaths.results; }
    resultsForOrder(orderId: string): string { return samplesPaths.results + '/' + orderId; }
}
