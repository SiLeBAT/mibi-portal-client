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
            // Scoped to the registration form: the page shell carries a form of its own,
            // and cy.within() refuses a subject with more than one element.
            cy.get('form:has([formcontrolname="institution"])').within(() => {
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
            cy.get('[formcontrolname="institution"]').clear().blur();
            // The label sits in the field's notched outline, not in the input's parent
            // (Angular Material MDC), and plain cy.contains('Institut') would match the
            // introductory paragraph first — hence the mat-form-field scope.
            cy.get('[formcontrolname="institution"]')
                .closest('mat-form-field')
                .contains('Institut')
                .should('have.css', 'color', 'rgb(228, 0, 57)');
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
            cy.intercept(
                { method: 'POST', url: `**${this.routes.registration}` },
                { statusCode: this.errors[0].status, body: this.errors[0].body }
            );

            fillOutRegistrationForm(this.users[4]);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.registrationFailure);
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.register);
        });

        it('should display banner for 400', function () {
            cy.intercept(
                { method: 'POST', url: `**${this.routes.registration}` },
                { statusCode: this.errors[3].status, body: this.errors[3].body }
            );

            fillOutRegistrationForm(this.users[4]);
            cy.get('[type="submit"]').click();
            cy.contains(this.banner.registrationFailure);
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.register);
        });

    });

});

// Helper function

function fillOutRegistrationForm(user: Record<string, string>) {
    // The institute list comes from the database, so the option picked here is the one the
    // E2E seed creates — see cypress/fixtures/seeded-institute.json.
    cy.fixture('seeded-institute.json').then((institute: { search: string; label: string }) => {
        cy.get('[formcontrolname="institution"]').type(institute.search);
        cy.contains(institute.label).click();
    });
    cy.get('[name="firstName"]').type(user.firstName);
    cy.get('[name="lastName"]').type(user.lastName);
    cy.get('[name="email"]').type(user.email);
    cy.get('[name="password1"]').type(user.password);
    cy.get('[name="password2"]').type(user.password);
}
