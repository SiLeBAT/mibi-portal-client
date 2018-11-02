import {
    Directive,
    OnChanges, Input, ComponentRef, ViewContainerRef, Compiler, ModuleWithComponentFactories, Component, Type, NgModule
} from '@angular/core';
import * as _ from 'lodash';
import { CommonModule } from '@angular/common';
import { ClientError } from '../../core/model/client-error';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[compile]'
})
export class CompileDirective implements OnChanges {
    @Input() compile: string;
    @Input() compileContext: any;

    compRef: ComponentRef<any> | null;

    constructor(private vcRef: ViewContainerRef, private compiler: Compiler) { }

    ngOnChanges() {
        if (!this.compile) {
            if (this.compRef) {
                this.updateProperties();
                return;
            }
            throw Error('You forgot to provide template');
        }

        this.vcRef.clear();
        this.compRef = null;

        const component = this.createDynamicComponent(this.compile);
        const module = this.createDynamicModule(component);
        this.compiler.compileModuleAndAllComponentsAsync(module)
            .then((moduleWithFactories: ModuleWithComponentFactories<any>) => {
                const compFactory = moduleWithFactories.componentFactories.find(x => x.componentType === component);

                if (!compFactory) {
                    throw new ClientError('Error compiling template.');
                }
                this.compRef = this.vcRef.createComponent(compFactory);
                this.updateProperties();
            })
            .catch(error => {
                // tslint:disable-next-line:no-console
                console.log(error);
            });
    }

    updateProperties() {
        _.forEach(this.compileContext, (v, k) => {
            if (this.compRef) {
                this.compRef.instance[k] = this.compileContext[k];
            }
        });
    }

    private createDynamicComponent(template: string) {
        @Component({
            selector: 'mibi-custom-dynamic-component',
            template: template
        })
        class CustomDynamicComponent { }
        return CustomDynamicComponent;
    }

    private createDynamicModule(component: Type<any>) {
        @NgModule({
            // You might need other modules, providers, etc...
            // Note that whatever components you want to be able
            // to render dynamically must be known to this module
            imports: [CommonModule],
            declarations: [component]
        })
        class DynamicModule { }
        return DynamicModule;
    }
}
