import { NgModule } from '@angular/core';
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

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([{
            path: 'content',
            children: [
                { path: 'faq', component: FAQViewComponent, resolve: { faqCollection: FAQResolver } }
            ]
        }]),
        MatExpansionModule,
        MatCardModule
    ],
    declarations: [
        FAQComponent,
        FAQViewComponent,
        FAQSectionComponent,
        FAQTocComponent
    ],
    exports: [
    ]
})
export class ContentModule { }
