import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FAQComponent } from './presentation/faq/faq.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FAQViewComponent } from './presentation/faq-view/faq-view.component';
import { FAQSectionComponent } from './presentation/faq-section/faq-section.component';
import { FAQTocComponent } from './presentation/faq-toc/faq-toc.component';
import { FAQResolver } from './service/faq-resolver.service';
import { MatCardModule } from '@angular/material/card';
import { DatenschutzerklaerungComponent } from './presentation/datenschutzerklaerung/datenschutzerklaerung.component';
import { DatenschutzerklaerungViewComponent } from './presentation/datenschutzerklaerung-view/datenschutzerklaerung-view.component';
import { FlexLayoutModule } from '@angular/flex-layout';
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FlexLayoutModule,
        RouterModule.forChild([{
            path: 'content',
            children: [
                { path: 'faq', component: FAQViewComponent, resolve: { faqCollection: FAQResolver } },
                { path: 'datenschutzerklaerung', component: DatenschutzerklaerungViewComponent }
            ]
        }]),
        MatExpansionModule,
        MatCardModule
    ],
    declarations: [
        FAQComponent,
        FAQViewComponent,
        FAQSectionComponent,
        FAQTocComponent,
        DatenschutzerklaerungComponent,
        DatenschutzerklaerungViewComponent
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContentModule { }
