/// <reference types="Cypress" />

describe('Testing the Datenschutzhinweise Page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.datenschutzhinweise);
            }
        );
    });

    describe('Testing the Datenschutzerklärung page content', function () {
        it('should display the page greeting', function () {
            cy.contains('h1', 'Datenschutzhinweise für Teilnehmer am MiBi-Portal des BfR gemäß Datenschutz-Grundverordnung (DS-GVO)');
        });
    });

    describe('Testing the Datenschutzerklärung page links', function () {
        it('should open a new tab for the allgemeinen Datenschutzbestimmungen page', function () {
            // tslint:disable-next-line: max-line-length
            cy.contains('allgemeinen Datenschutzbestimmungen').should('have.attr', 'href', 'https://www.bfr.bund.de/de/datenschutzerklaerung-107546.html')
                .should('have.attr', 'target', '_blank');
        });

        it('should open a new tab for the BfR page', function () {
            cy.contains('www.bfr.bund.de').should('have.attr', 'href', 'https://www.bfr.bund.de')
                .should('have.attr', 'target', '_blank');
        });

    });

});
