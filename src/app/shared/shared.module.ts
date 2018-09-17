import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownDirective } from './directive/dropdown.directive';
import { VersionDisplayComponent } from './presentation/version-display/version-display.component';
// tslint:disable-next-line:max-line-length
import { ClientVersionDisplayContainerComponent } from './container/client-version-display-container/client-version-display-container.component';
// tslint:disable-next-line:max-line-length
import { ServerVersionDisplayContainerComponent } from './container/server-version-display-container/server-version-display-container.component';
import { ViewLayoutComponent } from './presentation/view-layout/view-layout.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        DropdownDirective,
        VersionDisplayComponent,
        ClientVersionDisplayContainerComponent,
        ServerVersionDisplayContainerComponent,
        ViewLayoutComponent
    ],
    exports: [
        DropdownDirective,
        ClientVersionDisplayContainerComponent,
        ServerVersionDisplayContainerComponent,
        ViewLayoutComponent
    ]
})
export class SharedModule { }
