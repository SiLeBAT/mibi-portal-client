/// <reference types="Cypress" />

describe('Testing the Sample Upload Page', function () {
    beforeEach(() => {
        cy.fixture('ui-routes.json').as('paths').then(
            (paths) => {
                cy.visit(paths.upload);
            }
        );
    });

    describe('Testing the Sample Upload Page content', function () {
        it('should display the page greeting', function () {
            cy.contains('h1', 'Probeneinsendebogen hochladen');
        });
    });
});
