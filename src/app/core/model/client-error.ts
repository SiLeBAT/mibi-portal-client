export class ClientError extends Error {
    constructor(...args: any[]) {

        // Calling parent constructor of base Error class.
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, ClientError.prototype);
        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        // non standard V8 feature
        if ((Error as any).captureStackTrace) {
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}

export class AuthorizationError extends ClientError {
    constructor(...args: any[]) {
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
        this.name = this.constructor.name;
    }
}

export class EndpointError extends ClientError {
    constructor(public errorDTO: any, ...args: any[]) {
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, EndpointError.prototype);
        this.name = this.constructor.name;
    }
}

export class DelayLoginError extends AuthorizationError {
    constructor(public timeToWait: number, ...args: any[]) {
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, DelayLoginError.prototype);
        this.name = this.constructor.name;
    }
}

export class InvalidEmailError extends ClientError {
    constructor(public errorDTO: any, ...args: any[]) {
        // eslint-disable-next-line
        super(...args);
        Object.setPrototypeOf(this, InvalidEmailError.prototype);
        this.name = this.constructor.name;
    }
}

