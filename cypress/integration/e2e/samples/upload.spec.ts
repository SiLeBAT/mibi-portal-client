/// <reference types="cypress" />

describe('Use-cases Upload Page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.upload);
            }
        );
    });

    describe('Anonymous upload', function () {
        it('should upload einsendebogen', function () {
            const fileName = 'einsendebogen-v18.xlsx';
            cy.loadSamplesFile(fileName);
            cy.contains(fileName);
            cy.visit('/');
        });
    });

});
