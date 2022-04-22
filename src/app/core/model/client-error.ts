export class ClientError extends Error {
    constructor(...args: any[]) {

        // Calling parent constructor of base Error class.
        super(...args);
        Object.setPrototypeOf(this, ClientError.prototype);
        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class AuthorizationError extends ClientError {
    constructor(...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
        this.name = this.constructor.name;
    }
}

export class EndpointError extends ClientError {
    constructor(public errorDTO: any, ...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, EndpointError.prototype);
        this.name = this.constructor.name;
    }
}

export class DelayLoginError extends AuthorizationError {
    constructor(public timeToWait: number, ...args: any[]) {
        super(...args);
        Object.setPrototypeOf(this, DelayLoginError.prototype);
        this.name = this.constructor.name;
    }
}
