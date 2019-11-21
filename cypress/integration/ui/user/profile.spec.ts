/// <reference types="Cypress" />
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
        it('should redirect to the Welcome page', function () {
            cy.url().should('include', this.paths.root);
        });
    });

    describe('Testing the  Profile page for an authenticated user', function () {
        beforeEach(() => {
            cy.fixture('users.json')
                .then(
                    (users) => {
                        // @ts-ignore
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

            // FIXME: Not working, see ticket: #272
            xit('should display the page greeting', function () {
                cy.contains('mat-card-title', 'Profil');
            });

            xit('should display the user information', function () {
            });
        });

        describe('Testing the Profile page links', function () {
            xit('should allow the user to log out', function () {
            });

        });
    });

});
