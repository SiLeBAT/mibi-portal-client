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
            // The href in the template carries a stray leading space, which browsers trim
            // when navigating; the value is compared trimmed so the assertion checks the
            // link rather than the whitespace.
            cy.contains('allgemeinen Datenschutzbestimmungen')
                .should('have.attr', 'target', '_blank')
                .invoke('attr', 'href')
                .then(href => {
                    expect(String(href).trim()).to.equal('https://www.bfr.bund.de/datenschutz/');
                });
        });

        it('should open a new tab for the BfR page', function () {
            cy.contains('www.bfr.bund.de').should('have.attr', 'href', 'https://www.bfr.bund.de')
                .should('have.attr', 'target', '_blank');
        });

    });

});
