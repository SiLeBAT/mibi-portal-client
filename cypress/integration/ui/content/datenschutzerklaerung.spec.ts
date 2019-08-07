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
        it('should open a new tab for the Bundesdatenschutzgesetz (BDSG) page', function () {
            cy.contains('Bundesdatenschutzgesetz (BDSG)').should('have.attr', 'href', 'https://www.gesetze-im-internet.de/bdsg_2018/')
                .should('have.attr', 'target', '_blank');
        });

        it('should open a new tab for the Europäischen Datenschutz-Grundverordnung (DS-GVO) page', function () {
            // tslint:disable-next-line: max-line-length
            cy.contains('Europäischen Datenschutz-Grundverordnung (DS-GVO)').should('have.attr', 'href', 'https://eur-lex.europa.eu/legal-content/DE/TXT/PDF/?uri=CELEX:32016R0679&qid=1527147390147&from=EN')
                .should('have.attr', 'target', '_blank');
        });

        it('should navigate to the Datenschutzhinweise page', function () {
            cy.contains('Datenschutzhinweise').click();
            cy.url().should('include', this.paths.datenschutzhinweise);
        });

        it('should open a new tab for the MiBi-Portal page', function () {
            cy.contains('mibi-portal.bfr.bund.de').should('have.attr', 'href', 'https://mibi-portal.bfr.bund.de/')
                .should('have.attr', 'target', '_blank');
        });

        it('should open a new tab for the BfR page', function () {
            cy.contains('www.bfr.bund.de').should('have.attr', 'href', 'https://www.bfr.bund.de')
                .should('have.attr', 'target', '_blank');
        });

    });

});
