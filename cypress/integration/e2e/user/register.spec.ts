/// <reference types="cypress" />

describe('Use-cases Register Page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.register);
            }
        );
    });
    describe('User 5 register', function () {
        before(() => {
            cy.fixture('users.json').as('users');
            cy.fixture('api-routes.json').as('routes');
            cy.fixture('banner-messages.json').as('banner');
            cy.fixture('success-responses.json').as('success');
            cy.fixture('seeded-institute.json').as('institute');
        });

        it('should allow New User to register', function () {
            // A registered address cannot be registered again, so the run gets its own.
            // Without this the spec passes once and then fails on every later run against
            // the same database — seed-users.js only removes the fixture address itself.
            const user = this.users[4];
            const email = `newUser${Date.now()}@test.com`;
            // The institute comes from the E2E seed, not from a stub.
            cy.get('[formcontrolname="institution"]').type(this.institute.search);
            cy.contains(this.institute.label).click();
            cy.get('[name="firstName"]').type(user.firstName);
            cy.get('[name="lastName"]').type(user.lastName);
            cy.get('[name="email"]').type(email);
            cy.get('[name="password1"]').type(user.password);
            cy.get('[name="password2"]').type(user.password);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.registrationSuccess.replace('{email}', email));
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.login);
        });

    });
});
