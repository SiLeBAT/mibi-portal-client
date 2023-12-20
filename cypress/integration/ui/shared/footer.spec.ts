/// <reference types="Cypress" />

describe('Testing the Footer', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.root);
            }
        );
    });

    describe('Testing the Footer content', function () {
        it('should display the date of last change', function () {
            cy.get('footer').within(() => {
                cy.contains(/Letzte Änderung:\s*\d\d\.\d\d\.\d\d\d\d/);
            });
        });
    });

    describe('Testing the Footer links', function () {
        it('should open a new tab for the BfR page', function () {
            cy.get('footer').within(() => {
                cy.contains('BfR - Bundesinstitut für Risikobewertung').should('have.attr', 'href', 'https://www.bfr.bund.de')
                    .should('have.attr', 'target', '_blank');
            });
        });

        it('should open a new tab for the FoodRisk - Labs page', function () {
            cy.get('footer').within(() => {
                cy.contains('FoodRisk - Labs')
                    .should('have.attr', 'href', 'https://foodrisklabs.bfr.bund.de')
                    .should('have.attr', 'target', '_blank');
            });
        });

        it('should navigate to the FAQ page', function () {
            cy.get('footer').within(() => {
                cy.contains('FAQ').click();
                cy.url().should('equal', Cypress.config().baseUrl + this.paths.faq);
            });
        });

        it('should navigate to the Datenschutzerklärung page', function () {
            cy.get('footer').within(() => {
                cy.contains('Datenschutzerklärung').click();
                cy.url().should('equal', Cypress.config().baseUrl + this.paths.datenschutzerklaerung);
            });
        });

        it('should open a mail client for Probleme melden', function () {
            cy.get('footer').within(() => {
                cy.contains('Problem melden')
                    .should('have.attr', 'href', 'mailto:mibi-portal@bfr.bund.de?subject=MiBi-Portal-Problem:&body=Bitte schildern Sie uns Ihr Problem. Falls es Probleme mit einem hochgeladenen Probeneinsendebogen gab, hängen Sie diesen bitte an. Handelt es sich um ein Problem mit der Darstellung im MiBi-Portal, kann auch ein Screenshot hilfreich sein.')
                    .should('have.attr', 'target', '_top');
            });
        });

    });

});
