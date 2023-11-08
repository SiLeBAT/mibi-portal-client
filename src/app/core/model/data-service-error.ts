import { ClientError } from './client-error';
import { Sample } from '../../samples/model/sample-management.model';

export class InvalidInputError extends ClientError {
    constructor(public samples: Sample[], ...args: any[]) {
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, InvalidInputError.prototype);
        this.name = this.constructor.name;
    }
}

export class InputChangedError extends ClientError {
    constructor(public samples: Sample[], ...args: any[]) {
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, InputChangedError.prototype);
        this.name = this.constructor.name;
    }
}

export class ExcelVersionError extends ClientError {
    constructor(public version: string,...args: any[]) {
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, ExcelVersionError.prototype);
        this.name = this.constructor.name;
    }
}
