/// <reference types="Cypress" />

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
            // @ts-ignore
            cy.loadSamplesFile(fileName);
            cy.contains(fileName);
            cy.visit('/');
        });
    });

});
