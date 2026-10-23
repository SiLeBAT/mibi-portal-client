/// <reference types="cypress" />
/// <reference path="../../../support/index.d.ts" />

describe('Testing the Profile page', function () {

    describe('Testing the  Profile page for an anonymous user', function () {

        beforeEach(() => {
            cy.fixture('ui-routes.json').as('paths').then(
                (paths) => {
                    cy.visit(paths.profile);
                }
            );
        });
        it('should redirect to the Login page', function () {
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.login);
        });
    });

    describe('Testing the  Profile page for an authenticated user', function () {
        beforeEach(() => {
            cy.fixture('users.json')
                .then(
                    (users) => {
                        cy.login(users[0]);
                    }
                );

            cy.fixture('ui-routes.json')
                .then(
                    (paths) => {
                        cy.visit(paths.profile);
                    }
                );
        });
        describe('Testing the  Profile page content', function () {

            it('should display the page greeting', function () {
                cy.contains('mat-card-title', 'Persönliche Daten');
            });

            it('should display the user information', function () {
                // profile.component.html renders the account as a <dl>: the labels are
                // <dt>, the values <dd>. The values come from the seeded account
                // (e2e/seed/seed-users.js) and its institute.
                cy.fixture('users.json').then((users: Record<string, string>[]) => {
                    cy.fixture('seeded-institute.json').then(
                        (institute: { fullName: string }) => {
                            cy.get('.mibi-profile-details').within(() => {
                                cy.contains('dt', 'Vorname:')
                                    .next('dd')
                                    .should('have.text', users[0].firstName);
                                cy.contains('dt', 'Nachname:')
                                    .next('dd')
                                    .should('have.text', users[0].lastName);
                                cy.contains('dt', 'E-Mail:')
                                    .next('dd')
                                    .should('have.text', users[0].email);
                                // The profile shows name + addendum (getFullName), not
                                // the longer autocomplete label with zip and city.
                                cy.contains('dt', 'Institut:')
                                    .next('dd')
                                    .should('have.text', institute.fullName);
                            });
                        }
                    );
                });
            });
        });

        // The former 'should allow the user to log out' test was removed rather than
        // rewritten: the profile page has no logout control. Logging out happens through
        // the nav bar's avatar menu, which ui/shared/header.spec.ts covers.
    });

});
