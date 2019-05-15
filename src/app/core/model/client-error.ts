import { SampleData } from '../../samples/model/sample-management.model';

export class ClientError extends Error {
    // tslint:disable-next-line
    constructor(...args: any[]) {

        // Calling parent constructor of base Error class.
        super(...args);
        Object.setPrototypeOf(this, ClientError.prototype);
        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

    }
}

export class AuthorizationError extends ClientError {
    // tslint:disable-next-line
    constructor(...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
        this.name = this.constructor.name;
    }
}

export class InvalidInputError extends ClientError {
    // tslint:disable-next-line
    constructor(public data: SampleData[], ...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, InvalidInputError.prototype);
        this.name = this.constructor.name;
    }
}

export class InputChangedError extends ClientError {
    // tslint:disable-next-line
    constructor(public data: SampleData[], ...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, InputChangedError.prototype);
        this.name = this.constructor.name;
    }
}

export class DelayLoginError extends AuthorizationError {
    // tslint:disable-next-line
    constructor(public timeToWait: number, ...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, DelayLoginError.prototype);
        this.name = this.constructor.name;
    }
}
