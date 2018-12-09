export class ClientError extends Error {
    // tslint:disable-next-line
    constructor(...args: any[]) {

        // Calling parent constructor of base Error class.
        super(...args);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

    }
}
