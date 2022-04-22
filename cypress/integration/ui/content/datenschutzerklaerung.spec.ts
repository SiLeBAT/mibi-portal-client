/// <reference types="Cypress" />

describe('Testing the Datenschutzerklärung Page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.datenschutzerklaerung);
            }
        );
    });

    describe('Testing the Datenschutzerklärung page content', function () {
        it('should display the page greeting', function () {
            cy.contains('h1', 'Datenschutzerklärung');
        });
    });

    describe('Testing the Datenschutzerklärung page links', function () {
        it('should contain link to the Bundesdatenschutzgesetz (BDSG) page', function () {
            cy.contains('Bundesdatenschutzgesetz (BDSG)').should('have.attr', 'href', 'https://www.gesetze-im-internet.de/bdsg_2018/')
                .should('have.attr', 'target', '_blank');
        });

        it('should contain link to the Europäischen Datenschutz-Grundverordnung (DS-GVO) page', function () {
            cy.contains('Europäischen Datenschutz-Grundverordnung (DS-GVO)').should('have.attr', 'href', 'https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679')
                .should('have.attr', 'target', '_blank');
        });

        it('should navigate to the Datenschutzhinweise page', function () {
            cy.contains('Datenschutzhinweise').click();
            cy.url().should('equal', Cypress.config().baseUrl + this.paths.datenschutzhinweise);
        });

        it('should contain link to the MiBi-Portal page', function () {
            cy.contains('mibi-portal.bfr.bund.de').should('have.attr', 'href', 'https://mibi-portal.bfr.bund.de/')
                .should('have.attr', 'target', '_blank');
        });

        it('should contain link to the BfR page', function () {
            cy.contains('www.bfr.bund.de').should('have.attr', 'href', 'https://www.bfr.bund.de')
                .should('have.attr', 'target', '_blank');
        });
    });
});
