/// <reference types="Cypress" />
/// <reference path="../../../support/index.d.ts" />

import { User } from '../../../support/test.model';

describe('Testing the Header', function () {

    const activeNavigationLinkSelector = '.mibi-nav-bar-link';
    const appBarRightSelector = '.mibi-app-bar-top__right';
    const appBarLeftSelector = '.mibi-app-bar-top__left';
    const appName = 'MiBi-Portal';
    const samplesTab = 'Probendaten';
    const signIn = 'Anmelden';

    describe('Testing an anonymous user', function () {

        describe('without loaded data', function () {
            beforeEach(() => {
                cy.fixture('ui-routes.json').as('paths').then(
                    (paths) => {
                        cy.visit(paths.root);
                    }
                );
            });
            describe('Testing the Header links', function () {

                it('should have link to the Welcome page', function () {
                    cy.get(appBarLeftSelector).within(() => {
                        cy.contains(appName)
                            .should('have.attr', 'href', '/');
                    });
                });

                it('should have link to the Upload page', function () {
                    cy.get(activeNavigationLinkSelector).not('.hidden').should('have.attr', 'href', this.paths.upload).within(() => {
                        cy.contains(samplesTab);
                    });
                });

                it('should have link to the Login page', function () {
                    cy.get(appBarRightSelector).within(() => {
                        cy.contains(signIn)
                            .should('have.attr', 'href', this.paths.login);
                    });
                });
            });
        });
        // FIXME: Upload is not working yet
        xdescribe('with loaded data', function () {

            beforeEach(() => {

                cy.fixture('ui-routes.json').as('paths')
                    .then(
                        (paths) => {
                            const fileName = 'einsendebogen.xlsx';
                            // @ts-ignore
                            cy.loadSamplesFile(fileName, paths.root);
                        }
                    );
            });

            describe('Testing the Header links', function () {

                it('should have link to the Samples page', function () {
                    cy.get(activeNavigationLinkSelector).not('.hidden').should('have.attr', 'href', this.paths.samples).within(() => {
                        cy.contains(samplesTab);
                    });
                });

            });
        });
    });

    describe('Testing an authenticated user', function () {

        beforeEach(() => {
            cy.fixture('users.json')
                .then(
                    (users: User[]) => {
                        // @ts-ignore
                        cy.login(users[0]);
                    }
                );

            cy.fixture('ui-routes.json').as('paths')
                .then(
                    (paths) => {
                        cy.visit(paths.root);
                    }
                );
        });

        describe('Testing the Header links', function () {

            it('should have drop-down showing User information', function () {
                cy.get(appBarRightSelector).within(() => {
                    cy.get('.mibi-avatar');
                }).click();
                cy.get('.mibi-user-info').within(() => {
                    cy.contains('User1 User1');
                });
            });

            it('should link to user profile', function () {
                cy.get(appBarRightSelector).within(() => {
                    cy.get('.mibi-avatar');
                }).click();
                cy.get('a[role="menuitem"]').within(() => {
                    cy.contains('Profil');
                }).click();
                cy.url().should('equal', Cypress.config().baseUrl + this.paths.profile);
            });

            it('should log out the user', function () {
                cy.get(appBarRightSelector).within(() => {
                    cy.get('.mibi-avatar');
                }).click();
                cy.get('button[role="menuitem"]').within(() => {
                    cy.contains('Abmelden');
                }).click();
                cy.url().should('equal', Cypress.config().baseUrl + this.paths.login);
            });
        });
    });
});
