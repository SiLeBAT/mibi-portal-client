/// <reference types="cypress" />

describe('Use-cases Upload Page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.upload);
            }
        );
    });

    // FIXME: Upload is not working yet
    xdescribe('Anonymous upload', function () {
        it('should upload einsendebogen', function () {
            const fileName = 'einsendebogen.xlsx';
            cy.loadSamplesFile(fileName);
            cy.contains(fileName);
            cy.visit('/');
        });
    });

});
