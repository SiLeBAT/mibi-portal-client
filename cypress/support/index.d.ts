/// <reference types="cypress" />

import { Credentials } from './test.model';

// `declare global` is required: this file has imports, so it is a module, and a
// bare `declare namespace Cypress` would only declare a local namespace instead
// of augmenting Cypress' own.
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to log user into the front-end.
             * @example cy.login(users[0])
             */
            login(credentials: Credentials): Chainable<Element>;

            /**
             * Uploads an Einsendebogen fixture on the upload page and waits for
             * the sample and validation requests to come back.
             * @example cy.loadSamplesFile('einsendebogen.xlsx')
             */
            loadSamplesFile(fileName: string): Chainable<Element>;
        }
    }
}
