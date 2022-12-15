/// <reference types="Cypress" />

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
        });

        it('should allow New User to register', function () {
            const user = this.users[4];
            cy.get('[formcontrolname="institution"]').type('F');
            cy.contains('Fancy Institute, Berlin, 10115 Berlin').click();
            cy.get('[name="firstName"]').type(user.firstName);
            cy.get('[name="lastName"]').type(user.lastName);
            cy.get('[name="email"]').type(user.email);
            cy.get('[name="password1"]').type(user.password);
            cy.get('[name="password2"]').type(user.password);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.registrationSuccess);
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.login);
        });

    });
});
