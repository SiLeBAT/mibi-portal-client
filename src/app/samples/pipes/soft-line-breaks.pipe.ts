import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'softLineBreaks'
})
export class SoftLineBreaksPipe implements PipeTransform {
    transform(value: string, breakChars: string): string {
        if (!value) {
            return '';
        }

        const avvKode = /^\d+\|\d+\|.*$/;
        if (!avvKode.test(value)) {
            return value;
        }

        const regex = new RegExp(`[${breakChars}]`, 'g');
        const newValue = value.replace(regex, `$&<wbr />`);
        return newValue;
    }
}
