/// <reference types="Cypress" />

describe('Testing the Password Reset page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.recovery);
            }
        );
    });

    describe('Testing the  Password Reset page content', function () {
        it('should display the page greeting', function () {
            cy.contains('mat-card-title', 'Passwort zurücksetzen');
        });
    });

    describe('Testing the Password Reset page links', function () {
        it('should navigate back to the Login page', function () {
            cy.contains('Zurück').click();
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.login);
        });
    });

    describe('Testing the successful Password reset form submission', function () {
        before(() => {
            cy.fixture('users.json').as('users');
            cy.fixture('api-routes.json').as('routes');
            cy.fixture('banner-messages.json').as('banner');
            cy.fixture('success-responses.json').as('success');
        });

        it('should allow User1 to reset password', function () {
            cy.server();
            cy.route({
                method: 'PUT',
                url: this.routes.resetPasswordRequest,
                response: this.success[0].body,
                status: this.success[0].status

            });
            cy.get('[name="email"]').type(this.users[0].email);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.passwordResetRequest);
        });

    });

    describe('Testing Password Reset Page error states', function () {
        beforeEach(() => {
            cy.fixture('users.json').as('users');
            cy.fixture('api-routes.json').as('routes');
            cy.fixture('error-responses.json').as('errors');
            cy.fixture('banner-messages.json').as('banner');
        });

        it('should require email', function () {
            cy.get('[name="email"]').focus().blur();
            cy.get('.mat-form-field-label').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require valid email', function () {
            cy.get('[name="email"]').type('NonexistentUser').blur();
            cy.get('.mat-form-field-label').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should display banner on 500', function () {
            cy.server();
            cy.route({
                method: 'PUT',
                url: this.routes.resetPasswordRequest,
                response: this.errors[0].body,
                status: this.errors[0].status

            });

            cy.get('[name="email"]').type('NonexistentUser@none.com');
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.passwordResetError);
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.recovery);
        });

        it('should display banner for 400', function () {
            cy.server();
            cy.route({
                method: 'PUT',
                url: this.routes.resetPasswordRequest,
                response: this.errors[3].body,
                status: this.errors[3].status

            }).as('login');
            cy.get('[name="email"]').type(this.users[0].email);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.passwordResetError);
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.recovery);
        });

    });

});
