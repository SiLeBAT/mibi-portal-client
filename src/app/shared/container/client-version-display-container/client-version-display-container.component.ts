import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'mibi-client-version-display-container',
    template: `<mibi-version-display [artifact]="artifact" [version]="version"></mibi-version-display>`
})
export class ClientVersionDisplayContainerComponent {

    artifact = 'mibi-client';
    version: string = environment.version;
    constructor() { }
}
