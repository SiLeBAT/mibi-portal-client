import { ClientError } from './client-error';
import { Sample } from '../../samples/model/sample-management.model';

export class InvalidInputError extends ClientError {
    // tslint:disable-next-line
    constructor(public samples: Sample[], ...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, InvalidInputError.prototype);
        this.name = this.constructor.name;
    }
}

export class InputChangedError extends ClientError {
    // tslint:disable-next-line
    constructor(public samples: Sample[], ...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, InputChangedError.prototype);
        this.name = this.constructor.name;
    }
}
