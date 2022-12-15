/// <reference types="Cypress" />

describe('Testing the Registration Page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.register);
            }
        );
    });

    describe('Testing the Registration page content', function () {
        it('should display the page greeting', function () {
            cy.contains('mat-card-title', 'Registrierung');
            cy.get('form').within(() => {
                cy.contains('button', 'Registrieren');
            });
        });

    });

    describe('Testing the Registration page links', function () {
        it('should navigate back to the Login page', function () {
            cy.contains('Zurück').click();
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.login);
        });

        it('should navigate to the Datenschutzerklärung page', function () {
            cy.get('.mibi-register-footer').within(() => {
                cy.contains('Datenschutzerklärung')
                    .should('have.attr', 'href', '/content/datenschutzerklaerung');
            });
        });

        it('should navigate to the Datenschutzhinweise page', function () {
            cy.get('.mibi-register-footer').within(() => {
                cy.contains('Datenschutzhinweise')
                    .should('have.attr', 'href', '/users/datenschutzhinweise');
            });
        });
    });

    describe('Testing Login Page error states', function () {
        beforeEach(() => {
            cy.fixture('users.json').as('users');
            cy.fixture('api-routes.json').as('routes');
            cy.fixture('error-responses.json').as('errors');
            cy.fixture('banner-messages.json').as('banner');

        });

        it('should require institute', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[formcontrolname="institution"]').clear().blur()
                .parent().contains('Institut').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require first name', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[name="firstName"]').clear().blur();
            cy.contains('Vorname').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require last name', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[name="lastName"]').clear().blur();
            cy.contains('Nachname').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require email', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[name="email"]').clear().blur();
            cy.contains('E-Mail').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require valid email', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[name="email"]').clear().type('NonexistentUser').blur();
            cy.contains('E-Mail').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require password1', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[name="password1"]').clear().blur();
            cy.contains('Passwort').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require password2', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[name="password2"]').clear().blur();
            cy.contains('Passwort bestätigen').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should require password1 & password2 to match', function () {
            fillOutRegistrationForm(this.users[4]);
            cy.get('[name="password2"]').clear().type('nottherightpassword').blur();
            cy.contains('Passwort bestätigen').should('have.css', 'color', 'rgb(228, 0, 57)');
            cy.get('[type="submit"]').should('be.disabled');
        });

        it('should display banner on 500', function () {
            cy.server();
            cy.route({
                method: 'POST',
                url: this.routes.registration,
                response: JSON.stringify(this.errors[0].body),
                status: this.errors[0].status

            });

            fillOutRegistrationForm(this.users[4]);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.registrationFailure);
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.register);
        });

        it('should display banner for 400', function () {
            cy.server();
            cy.route({
                method: 'POST',
                url: this.routes.registration,
                response: JSON.stringify(this.errors[3].body),
                status: this.errors[3].status

            });

            fillOutRegistrationForm(this.users[4]);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.registrationFailure);
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.register);
        });

    });

});

// Helper function

function fillOutRegistrationForm(user: Record<string, string>) {
    cy.get('[formcontrolname="institution"]').type('F');
    cy.contains('Fancy Institute, Berlin, 10115 Berlin').click();
    cy.get('[name="firstName"]').type(user.firstName);
    cy.get('[name="lastName"]').type(user.lastName);
    cy.get('[name="email"]').type(user.email);
    cy.get('[name="password1"]').type(user.password);
    cy.get('[name="password2"]').type(user.password);
}
